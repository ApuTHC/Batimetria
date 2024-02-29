import os
import json
import geopandas as gpd

from geo.Geoserver import Geoserver
import rasterio
import numpy as np
import math
from rasterio.features import geometry_mask
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter

from recursos.models import Recursos, RecursosGenerados
from recursos.serializers import RecursosGeneradosSerializer
from django.db.models import Q


def eval_embalse(infoJSON, user):
    proyant_id = infoJSON.get('proyant')
    proydes_id = infoJSON.get('proydes')

    recursoAnt = Recursos.objects.get(id=proyant_id)
    recurso = RecursosGenerados.objects.filter(Q(id_recurso_1=proyant_id) & Q(id_recurso_2=proydes_id))
    print(recurso)
    if recurso.exists():
        recurso = recurso[0]
        response = {
            "existe": True,
            "id": recurso.id,
            "id_embalse": recurso.id_embalse_id,
            'env': recurso.env,
            'nombre': recurso.nombre,
            'capa': recurso.capa,
            'nombre_file': recurso.nombre_file,
        }
        return response
    else:
        pathRec = './visor/static/Geodata/Proyectos/'
        pathRes = './visor/static/Geodata/Proyectos/Calderas/Resultados/'

        proyant = Recursos.objects.get(id=proyant_id).nombre
        proydes = Recursos.objects.get(id=proydes_id).nombre

        name_result = proyant.replace('Batimetria ', '').replace('Batimetría ', '').replace(' ',
                                                                                            '_') + '_to_' + proydes.replace(
            'Batimetria ', '').replace('Batimetría ', '').replace(' ', '_') + '.tif'

        pat_result = pathRes + name_result
        calculado = False
        vMax = 0
        vMin = 0
        env = ""

        if os.path.exists(pat_result):
            calculado = True

        # if not calculado:
        print("calcula")
        proyant = Recursos.objects.get(id=proyant_id).nombre_file
        proydes = Recursos.objects.get(id=proydes_id).nombre_file
        path_src1 = pathRec + proyant
        path_src2 = pathRec + proydes

        with rasterio.open(path_src1) as src1, rasterio.open(path_src2) as src2:
            # Lee los datos de los rasters
            data1 = src1.read(1)
            data2 = src2.read(1)

            # Calcula la diferencia entre los rasters
            diferencia_data = data2 - data1
            diferencia_data = np.where(diferencia_data > 1000, 0, diferencia_data)
            vMax = diferencia_data.max()
            vMin = diferencia_data.min()
            env = f"low:{str(math.floor(vMin))};high:{str(math.ceil(vMax))};medium:0"
            # Configura los metadatos para el nuevo raster
            profile = src1.profile

            # Guarda los datos de la diferencia en el perfil del nuevo raster
            profile.update(count=1, dtype=str(diferencia_data.dtype))

            # Crea un nuevo archivo raster para la diferencia
            with rasterio.open(pat_result, 'w', **profile) as dst:
                # Escribe los datos de la diferencia en el nuevo raster
                dst.write(diferencia_data, 1)
        nombre_layer = name_result.replace('.tif', '')
        geo = Geoserver('http://127.0.0.1:8080/geoserver', username='admin', password='geoserver')
        geo.create_coveragestore(layer_name=nombre_layer, path=pat_result, workspace='prueba')
        nombre_layer_wms = 'prueba:' + nombre_layer
        geo.publish_style(layer_name=nombre_layer, style_name='estilos_erosion_depo', workspace='prueba')

        recursoGenerado_data = {
            "id_empresa": recursoAnt.id_empresa_id,
            "id_embalse": recursoAnt.id_embalse_id,
            "id_tipo_recurso": 1,
            "id_recurso_1": proyant_id,
            "id_recurso_2": proydes_id,
            "env": env,
            "nombre": nombre_layer,
            "capa": nombre_layer_wms,
            "ruta": "http://localhost:8080/geoserver/prueba/wms",
            "nombre_file": name_result,
        }

        recursoGenerado_serializer = RecursosGeneradosSerializer(data=recursoGenerado_data)
        if recursoGenerado_serializer.is_valid():
            ids = recursoGenerado_serializer.save()

        response = {
            "existe": False,
            "id": ids.id,
            "id_embalse": recursoAnt.id_embalse_id,
            'env': env,
            'nombre': nombre_layer,
            'capa': nombre_layer_wms,
            'nombre_file': name_result,
        }
        return response


def eval_perfil(infoJSON):
    perfil = json.loads(infoJSON.get('geojson'))
    datos = json.loads(infoJSON.get('datos'))
    dems = datos["dems"]
    nombres = datos["nombres"]
    proyecto = infoJSON.get('proyecto')
    ukey = infoJSON.get('ukey')
    name = infoJSON.get('name')
    ids = infoJSON.get('id')

    pathperf = './visor/static/Geodata/Proyectos/' + proyecto + '/Resultados/' + ukey

    if not os.path.exists(pathperf):
        os.makedirs(pathperf)

    with open(pathperf + '/linea_perfil.geojson', "w") as archivo:
        json.dump(perfil, archivo, indent=4)

    def extract_profile(dem, geom):
        pathi = './visor/static/Geodata/Proyectos/'
        with rasterio.open(pathi + dem, 'r') as src:
            # Obtener los valores del DEM a lo largo de la línea
            mask = geometry_mask([geom], out_shape=src.shape, transform=src.transform, invert=True)
            data = src.read(1, masked=True)
            profile = data[mask]

        return profile

    def smooth_profile(profile, window_size=11, polyorder=2):
        return savgol_filter(profile, window_size, polyorder)

    def plot_profiles(profiles, colors, labels, pathperf):
        plt.figure(figsize=(10, 6))

        for profile, color, label in zip(profiles, colors, labels):
            smoothed_profile = smooth_profile(profile)
            plt.plot(smoothed_profile, color=color, label=label)

        plt.xlabel('Distancia')
        plt.ylabel('Elevación')
        plt.legend()
        plt.title('Perfiles de Elevación Suavizados')
        # plt.show()
        plt.savefig(pathperf + '/Perfil.png', dpi=500)

    # Lista de rutas a los archivos DEM
    dem_files = dems

    # Ruta al archivo GeoJSON que contiene la línea
    geojson_file = pathperf + '/linea_perfil.geojson'

    # Cargar la línea desde el archivo GeoJSON
    line_gdf = gpd.read_file(geojson_file)
    line = line_gdf.geometry.iloc[0]

    # Colores y etiquetas para los perfiles
    colors = ['r', 'g', 'b']  # Puedes personalizar estos colores
    labels = ['Perfil 1', 'Perfil 2', 'Perfil 3']  # Puedes personalizar estas etiquetas

    # Extraer perfiles de elevación para cada DEM
    profiles = [extract_profile(dem_file, line) for dem_file in dem_files]

    # Mostrar los perfiles suavizados en una gráfica
    plot_profiles(profiles, colors, nombres, pathperf)

    response = {
        'status': True,
        'id': ids,
        'img': 'Proyectos/' + proyecto + '/Resultados/' + ukey + '/Perfil.png'
    }

    return response