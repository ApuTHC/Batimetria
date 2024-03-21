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
from django.db.models import Q

from rasterio.mask import mask
from rasterio.coords import BoundingBox

from shapely.geometry import box


def eval_embalse(data):
    proyant_id = data.get('id_1')
    proydes_id = data.get('id_2')

    recursoAnt = Recursos.objects.get(id=proyant_id)
    recurso = RecursosGenerados.objects.filter(Q(id_recurso_1=proyant_id) & Q(id_recurso_2=proydes_id))
    print(recurso)
    if recurso.exists():
        response = {
            "existe": True,
        }
        return response
    else:
        pathRec = './dist/static/Geodata/Proyectos/'
        pathRes = './dist/static/Geodata/Proyectos/Calderas/Resultados/'

        proyant = Recursos.objects.get(id=proyant_id).nombre
        proydes = Recursos.objects.get(id=proydes_id).nombre

        name_result = proyant.replace('Batimetria ', '').replace('Batimetría ', '').replace(' ',
                                                                                            '_') + '_to_' + proydes.replace(
            'Batimetria ', '').replace('Batimetría ', '').replace(' ', '_') + '.tif'

        pat_result = pathRes + name_result

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
            diferencia_data = np.where(diferencia_data < -1000, 0, diferencia_data)
            diferencia_data = np.where(diferencia_data > 1000, 0, diferencia_data)
            vMax = diferencia_data.max()
            vMin = diferencia_data.min()
            env = f"low:{str(math.floor(vMin))};high:{str(math.ceil(vMax))};medium:0"
            # Configura los metadatos para el nuevo raster
            profile = src1.profile
            src1.close()
            src2.close()

            # Guarda los datos de la diferencia en el perfil del nuevo raster
            profile.update(count=1, dtype=str(diferencia_data.dtype))
            # Crea un nuevo archivo raster para la diferencia
            with rasterio.open(pat_result, 'w', **profile) as dst:
                # Escribe los datos de la diferencia en el nuevo raster
                dst.write(diferencia_data, 1)
        nombre_layer = name_result.replace('.tif', '')
        geo = Geoserver('http://3.88.142.9:8080/geoserver', username='admin', password='geoserver')
        # geo = Geoserver('http://127.0.0.1:8080/geoserver', username='admin', password='geoserver')
        geo.create_coveragestore(layer_name=nombre_layer, path=pat_result, workspace='prueba')
        nombre_layer_wms = 'prueba:' + nombre_layer
        geo.publish_style(layer_name=nombre_layer, style_name='estilos_erosion_depo', workspace='prueba')
        # geo.publish_style(layer_name=nombre_layer, style_name='raster', workspace='prueba')

        recurso_generado_obj = {
            "existe": False,
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

        return recurso_generado_obj


def eval_perfil(infoJSON):
    perfil = infoJSON.get('geojson')
    dems = infoJSON.get('demsPerfil')
    nombres = infoJSON.get('nombresPerfil')
    ids = infoJSON.get('idsPerfil')
    proyecto = infoJSON.get('proyecto')
    ukey = infoJSON.get('ukey')
    name = infoJSON.get('name')
    id = infoJSON.get('id')

    pathperf = './dist/static/Geodata/Proyectos/' + proyecto + '/Resultados/' + ukey

    if not os.path.exists(pathperf):
        os.makedirs(pathperf)

    with open(pathperf + '/linea_perfil.geojson', "w") as archivo:
        json.dump(perfil, archivo, indent=4)

    def extract_profile(dem, geom):
        pathi = './dist/static/Geodata/Proyectos/'
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

    # Extraer perfiles de elevación para cada DEM
    profiles = [extract_profile(dem_file, line) for dem_file in dem_files]

    # Mostrar los perfiles suavizados en una gráfica
    plot_profiles(profiles, colors, nombres, pathperf)

    response = {
        'status': True,
        'id': id,
        'name': name,
        'dems': dems,
        'ids': ids,
        'nombres': nombres,
        'proyecto': proyecto,
        'ukey': ukey,
        'img': 'Proyectos/' + proyecto + '/Resultados/' + ukey + '/Perfil.png'
    }

    return response