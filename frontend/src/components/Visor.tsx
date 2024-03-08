import React, {useEffect, useState} from 'react';
import 'leaflet/dist/leaflet.css';
import * as L from "leaflet";
import 'leaflet-sidebar-v2/css/leaflet-sidebar.css';
import 'leaflet-sidebar-v2';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCircleInfo,
    faMap,
    faMagnifyingGlassLocation,
    faLayerGroup,
    faCaretLeft,
    faChartLine,
    faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import 'esri-leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import $ from 'jquery';
import '../assets/L.switchBasemap.js';
import '../assets/L.switchBasemap.css'
import '../assets/leaflet.fusesearch.css'
import '../assets/leaflet.fusesearch.js'
import * as WMS from "leaflet.wms";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import '../assets/estilosVisor.css'
import {toast} from "react-hot-toast";

import {Accordion, Tab, Nav, Form, Button, Modal} from 'react-bootstrap';
import {Embalse, Medicion, Perfil, Recurso} from "../Interfaces.ts";
import {useMutation} from "@tanstack/react-query";
import {eval_embalse, eval_perfil} from "../api/visor.ts";
import {delete_perfil, edit_perfil, post_perfil} from "../api/recursos.ts";




interface Props {
    recursos: []
    embalses: []
    recursos_gen: []
    perfiles: []
    mediciones: []
}

let map: L.Map;
let perfilesArray = {};


const Visor = ({recursos, embalses, recursos_gen, perfiles, mediciones}: Props) => {

    console.log(embalses)
    console.log(recursos)
    console.log(recursos_gen)
    console.log(perfiles)
    console.log(mediciones)

    let mapInitialized = false;
    let sidebar: L.Control.Sidebar;

    const [activeKey, setActiveKey] = useState("1");

    const [show, setShow] = useState(false);
    const [uKey, setUKey] = useState("");
    const [geojsonPerfil, setGeojsonPerfil] = useState("");
    const [imgURL, setImgURL] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [namePerfil, setNamePerfil] = useState("");
    const [proyectoPerfil, setProyectoPerfil] = useState("");
    const [idsPerfil, setIdsPerfil] = useState([0]);
    const [nombresPerfil, setNombresPerfil] = useState([""]);
    const [demsPerfil, setDemsPerfil] = useState([""]);
    const [layerPerfil, setLayerPerfil] = useState();
    const [idPerfil, setIdPerfil] = useState(0);



    const handleClose = () => setShow(false);

    useEffect(() => {
        if (!mapInitialized) {
            map = L.map('map').setView([6.24, -75.57], 9);
            const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            mapInitialized = true;

            sidebar = L.control.sidebar({
                autopan: false,
                closeButton: true,
                container: 'sidebar',
                position: 'left',
            }).addTo(map);

            const basemaps_array = [
                {
                    layer: osm, //DEFAULT MAP
                    icon: './src/assets/img1.PNG',
                    name: 'OpenStreetMap'
                },
                {
                    layer: EsriLeaflet.basemapLayer('Imagery'),
                    icon: './src/assets/img2.PNG',
                    name: 'Imagery ESRI'
                },
                {
                    layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                    }),
                    icon: './src/assets/img3.PNG',
                    name: 'OpenTopoMap'
                },
                {
                    layer: L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
                        attribution: '© Google'
                    }),
                    icon: './src/assets/img4.PNG',
                    name: 'Google Maps'
                },
            ];
            const basemaps = new L.Control.basemapsSwitcher(basemaps_array, {position: 'topright'}).addTo(map);
            $("#basemapContent").append($(basemaps._container));
            $(basemaps._container).find(".basemapImg").removeClass("hidden");

            const searchCtrl = L.control.fuseSearch().addTo(map);
            $("#buscadorContent").append($(".leaflet-fusesearch-panel .content"));
            $(searchCtrl._container).remove();
            $("#buscadorContent .content .header").prepend('<i class="fa-solid fa-magnifying-glass-location iconoBuscador"></i>');
            $("#buscadorContent .content .header").addClass("headerBuscador");
            $("#buscadorContent .content .header .search-input").addClass("buscador");
            $("#buscadorContent .content .header img").remove();
            $("#buscadorContent .content .header .close").remove();


            map.pm.setLang('es');
            map.on('pm:create', function (e) {
                e.layer.on('click', function (ev) {
                    setShow(true)
                    setUKey(Math.random().toString(36).substring(2))
                    setGeojsonPerfil(this.toGeoJSON())
                    setImgURL("");
                    setImageURL("");
                    setNamePerfil("Perfil Nuevo");
                    setIdsPerfil([]);
                    setIdPerfil(0);
                    setProyectoPerfil("");
                    setNombresPerfil([""])
                    setDemsPerfil([""])
                    setLayerPerfil(this);
                });
            });
            map.pm.addControls({
                position: 'topleft',
                drawMarker: false,
                drawPolyline: true,
                drawRectangle: false,
                drawPolygon: false,
                drawCircle: false,
                drawCircleMarker: false,
                drawText: false,
                editMode: false,
                dragMode: false,
                cutPolygon: false,
                removalMode: false,
                rotateMode: false
            });
            const drawOptions = {
                templineStyle: {
                    weight: 3,    // Grosor de la línea temporal
                },
                pathOptions: {
                    weight: 10,     // Grosor de la línea final
                },
            };

            map.pm.setGlobalOptions(drawOptions);

            const embalsesLayer = L.layerGroup();
            for (let i = 0; embalses.length > i; i++) {
                const element = embalses[i];
                const point = L.marker([element['latitud'], element['longitud']]).toGeoJSON();
                L.extend(point.properties, {
                    nombre: element['nombre'],
                    id: element['id'],
                    area: element['area'],
                });
                L.geoJson(point, {
                        onEachFeature: function (feature, layer) {
                            feature.layer = layer;
                            layer.bindPopup(popupEmbalses);
                        }
                    }
                )
                    .bindPopup(popupEmbalses)
                    .addTo(embalsesLayer)
            }
            embalsesLayer.addTo(map);
            searchCtrl.indexFeatures(embalsesLayer.toGeoJSON(), ['nombre']);

        }
    }, []);


    function popupEmbalses(layer) {
        sidebar.open('capas');
        setActiveKey(() => (`embalse_${layer.feature.properties.id}`));
        return L.Util.template('<p class="d-inline-block"><strong>Embalse</strong>: {nombre}. </p>', layer.feature.properties)
    }

    let obj_capas_recursos: { [key: string]: [any, string, boolean] } = {};
    console.log(obj_capas_recursos)

    const handleRecursoChange = (event: React.ChangeEvent<HTMLInputElement>, resourceId: number, isResource: boolean) => {
        let recursos1: Recurso[] = recursos;
        let idResAux: any;
        if (isResource) {
            idResAux = resourceId;
        } else {
            idResAux = resourceId + '_gen';
            recursos1 = recursos_gen;
        }
        console.log(recursos1)
        console.log(idResAux)
        console.log(resourceId)

        const isChecked = event.target.checked;
        console.log(`El recurso con ID ${idResAux} fue cambiado. Está ${isChecked ? 'seleccionado' : 'deseleccionado'}.`);
        if (isChecked) {
            if (obj_capas_recursos[idResAux] === undefined) {
                console.log(`El recurso con ID ${idResAux} no existe en el mapa.`);
                const true_resource = recursos1.find(objeto => objeto.id === resourceId);

                const layerWMS = WMS.source(true_resource.ruta, {
                    attribution: "",
                    useCors: false,
                    opacity: 1,
                    maxZoom: 25,
                    format: 'image/png',
                    layers: true_resource.nombre,
                    transparent: true,
                    version: '1.3.0',
                    info_format: 'text/html',
                    env: "nn"
                });

                const capa = layerWMS.getLayer(true_resource.capa).addTo(map);
                const legend = "http://localhost:8080/geoserver/prueba/wms" + "?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" + "prueba:MDT_Diciembre_2019";
                $("#legend_" + idResAux).append('<div className="legend_capa"><img src="' + legend + '" alt="Leyenda" /></div>');
                obj_capas_recursos[idResAux] = [capa, legend, true];
            } else {
                map.addLayer(obj_capas_recursos[idResAux][0]);
                $('#legend_' + idResAux).append('<div className="legend_capa"><img src="' + obj_capas_recursos[idResAux][1] + '" alt="Leyenda" /></div>');
                obj_capas_recursos[idResAux][2] = true;
            }
        } else {
            map.removeLayer(obj_capas_recursos[idResAux][0]);
            $('#legend_' + idResAux).empty();
            obj_capas_recursos[idResAux][2] = false;
        }
    };

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>, resourceId: number, isResource: boolean) => {

        let idResAux: any;
        if (isResource) {
            idResAux = resourceId;
        } else {
            idResAux = resourceId + '_gen';
        }

        const value = event.target.value;
        console.log(`El recurso con ID ${idResAux} cambió su transparencia a ${value}.`);
        $(`#valTransp_${idResAux}`).text(value);
        var opacidad = (100 - parseInt(value)) / 100;
        if (obj_capas_recursos[idResAux] !== undefined) {
            if (obj_capas_recursos[idResAux][2]) {
                obj_capas_recursos[idResAux][0].setOpacity(opacidad);
            }
        }
    };

    const eval_embalse_Mutation = useMutation({
        mutationFn: () => eval_embalse(id_1, id_2),
        onSuccess: (response) => {
            console.log(response.data)
            recursos_gen.push(response.data)
            toast.success("Calculo de Diferencia Exitoso!");
        },
        onError: () => {
            toast.error("Ocurrió un error, Volver a intentar");
        }
    })
    let id_1: number = 0;
    let id_2: number = 0;
    const handleDiferencia = (event: React.ChangeEvent<HTMLInputElement>, embalseId: number) => {
        event.preventDefault()
        console.log(embalseId)
        console.log($("#select-1_" + embalseId).val())
        console.log($("#select-2_" + embalseId).val())
        id_1 = parseInt($("#select-1_" + embalseId).val());
        id_2 = parseInt($("#select-2_" + embalseId).val());
        eval_embalse_Mutation.mutate()
    };
    const handleEmbalseClick = (event: React.ChangeEvent<HTMLInputElement>, embalseId: number) => {
        event.preventDefault()
        console.log(embalseId)
        const embalseClick = embalses.find(objeto => objeto.id === embalseId);
        map.setView([embalseClick['latitud'], embalseClick['longitud']], 16);
    };


    let proyecto: string = "";
    const handlePerfilClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        const rutas_dem: string[] = [];
        const name_datos: string[] = [];
        const ids_datos: number[] = [];
        recursos.map((recurso: Recurso) => {
            if (recurso.id_tipo_recurso == 1) {
                if ($("#checkperfil_" + recurso.id).is(':checked')) {
                    rutas_dem.push(recurso.nombre_file);
                    name_datos.push(recurso.nombre);
                    ids_datos.push(recurso.id);
                }
            }
        })
        if ($("#nameperfil").val() === "" || $("#nameperfil").val() === undefined){
            toast.error("Debe ingresar un nombre para el perfil");
            return;
        }
        else{
            setNamePerfil($("#nameperfil").val().toString())
        }
        if (rutas_dem.length === 0){
            toast.error("Debe seleccionar al menos un recurso para el perfil");
            return;
        }
        else{
            setIdsPerfil(ids_datos)
            setNombresPerfil(name_datos)
            setDemsPerfil(rutas_dem)
            setProyectoPerfil(rutas_dem[0].split("/")[0]);
            eval_perfil_Mutation.mutate()
        }

    };

    const eval_perfil_Mutation = useMutation({
        mutationFn: () => eval_perfil(geojsonPerfil, idsPerfil, nombresPerfil, demsPerfil, proyectoPerfil, uKey, namePerfil, idPerfil),
        onSuccess: (response) => {
            console.log(response.data)
            const imageUrl = import.meta.env.VITE_BACKEND_URL + '/static/Geodata/'+response.data.img;
            const timestamp = new Date().getTime();
            const updatedImageUrl = imageUrl + '?t=' + timestamp;
            setImgURL(updatedImageUrl);
            setImageURL(response.data.img);
            // recursos_gen.push(response.data)

            const newPerfil = layerPerfil;
            newPerfil.ukey = uKey;
            map.removeLayer(layerPerfil);
            perfilesArray[response.data.ukey] = {"geo":geojsonPerfil,
                'id': response.data.id,
                'nombre': response.data.name,
                'dems': response.data.dems,
                'ids': response.data.ids,
                'nombres': response.data.nombres,
                'proyecto': response.data.proyecto,
                'ukey': response.data.ukey,
                'img': response.data.img,
                'layer': newPerfil
            };
            newPerfil.addTo(map);
            newPerfil.on('click', function(e) {
                const ukeyid = this.ukey;
                showPerfilModal(ukeyid);
            });
            toast.success("Perfil graficado con exito!");
        },
        onError: () => {
            toast.error("Ocurrió un error, Volver a intentar");
        }
    })

    console.log(perfilesArray)

    const addPerfilMutation = useMutation({
        mutationFn: post_perfil,
        onSuccess: (response) => {
            console.log(response.data)
            perfiles.push(response.data)
            perfilesArray[response.data.ukey].id = response.data.id;
            toast.success("Perfil Creado Exitosamente");
        },
        onError: (error) => {
            toast.error("Error al agregar el perfil");
            console.error(error);
        },
    });
    const editPerfilMutation = useMutation({
        mutationFn: edit_perfil,
        onSuccess: (response) => {
            console.log(response.data)
            const id_aux = perfiles.findIndex(objeto => objeto.id === response.data.id);
            console.log(id_aux)
            perfiles[id_aux] = response.data;
            toast.success("Perfil Editado Exitosamente");
        },
        onError: (error) => {
            toast.error("Error al editar el perfil");
            console.error(error);
        },
    });
    const deletePerfilMutation = useMutation({
        mutationFn: delete_perfil,
        onSuccess: (response) => {
            console.log(response)
            $(`#content_perfil_${response.data.id}`).remove();
            const perfil_aux = perfiles.find(objeto => objeto.id === response.data.id);
            map.removeLayer(perfilesArray[perfil_aux.ukey].layer);
            toast.success("Perfil Eliminado Exitosamente");
        },
        onError: (error) => {
            toast.error("Error al eliminar el perfil");
            console.error(error);
        },
    });

    const handleSavePerfil = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (imgURL === ""){
            toast.error("Debe graficar el perfil antes de guardarlo.");
        }
        else{
            const id_embalse_aux = recursos.find(objeto => objeto.id === idsPerfil[0]).id_embalse;
            if(idPerfil === 0){
                addPerfilMutation.mutate({
                    id:0,
                    id_empresa:0,
                    id_embalse: id_embalse_aux,
                    nombre: namePerfil,
                    nombres: JSON.stringify(nombresPerfil),
                    proyectos: proyectoPerfil,
                    ukey: uKey,
                    img: imageURL,
                    geojson: JSON.stringify(geojsonPerfil),
                    dems: JSON.stringify(demsPerfil),
                    ids: JSON.stringify(idsPerfil)
                });
            }
            else{
                editPerfilMutation.mutate({
                    id:idPerfil,
                    id_empresa:0,
                    id_embalse: id_embalse_aux,
                    nombre: namePerfil,
                    nombres: JSON.stringify(nombresPerfil),
                    proyectos: proyectoPerfil,
                    ukey: uKey,
                    img: imageURL,
                    geojson: JSON.stringify(geojsonPerfil),
                    dems: JSON.stringify(demsPerfil),
                    ids: JSON.stringify(idsPerfil)
                });
            }
        }
    };

    const handlePerfilShow = (event: React.FormEvent<HTMLFormElement>, idPerfil, isBtn) => {
        const perfil_aux = perfiles.find(objeto => objeto.id === idPerfil);
        if (perfilesArray[perfil_aux.ukey] === undefined){
            const newPerfil = L.geoJSON(JSON.parse(perfil_aux.geojson), {weight: 10})
            newPerfil.ukey = perfil_aux.ukey;
            perfilesArray[perfil_aux.ukey] = {
                "geo":JSON.parse(perfil_aux.geojson),
                'id': perfil_aux.id,
                'nombre': perfil_aux.nombre,
                'dems': JSON.parse(perfil_aux.dems),
                'ids': JSON.parse(perfil_aux.ids),
                'nombres': JSON.parse(perfil_aux.nombres),
                'proyecto': perfil_aux.proyectos,
                'ukey': perfil_aux.ukey,
                'img': perfil_aux.img,
                'layer': newPerfil
            };
            newPerfil.on('click', function(e) {
                const ukeyid = this.ukey;
                showPerfilModal(ukeyid);
            });
        }
        if (!isBtn){
            const isChecked = event.target.checked;
            if(isChecked){
                perfilesArray[perfil_aux.ukey].layer.addTo(map);
            }
            else{
                map.removeLayer(perfilesArray[perfil_aux.ukey].layer);
            }
        }
        else{
            const ukeyid = perfil_aux.ukey;
            showPerfilModal(ukeyid);
        }
    };

    const handlePerfilDelete = (event: React.FormEvent<HTMLFormElement>, idPerfil) => {
        deletePerfilMutation.mutate(idPerfil);
    };

    function showPerfilModal(ukeyid) {
        setShow(true)
        setUKey(perfilesArray[ukeyid].ukey)
        setGeojsonPerfil(perfilesArray[ukeyid].geo)
        setLayerPerfil(perfilesArray[ukeyid].layer);
        setNamePerfil(perfilesArray[ukeyid].nombre);
        setIdsPerfil(perfilesArray[ukeyid].ids);
        setIdPerfil(perfilesArray[ukeyid].id);
        setNombresPerfil(perfilesArray[ukeyid].nombres)
        setDemsPerfil(perfilesArray[ukeyid].dems)
        setProyectoPerfil(perfilesArray[ukeyid].proyecto)
        const imageUrl = import.meta.env.VITE_BACKEND_URL + '/static/Geodata/'+perfilesArray[ukeyid].img;
        const timestamp = new Date().getTime();
        const updatedImageUrl = imageUrl + '?t=' + timestamp;
        setImgURL(updatedImageUrl);
        setImageURL(perfilesArray[ukeyid].img);
    }

    let tipos = {};
    let fechas = {};

    embalses.forEach(emb => {
        tipos[emb.id] = [];
        fechas[emb.id] = [];
        mediciones.forEach(med => {
            if (med.id_embalse === emb.id) {
                if(!tipos[emb.id].includes(med.tipo)) {
                    tipos[emb.id].push(med.tipo);
                }
                if(!fechas[emb.id].includes(med.fecha)) {
                    fechas[emb.id].push(med.fecha);
                }
            }
        })
    });

    const handleEvalMedi  = (event: React.FormEvent<HTMLFormElement>, idEmbalse, change) => {
        const tipo = $("#tipo_medicion_" + idEmbalse).val().toString();
        const fecha = $("#fecha_medicion_" + idEmbalse).val().toString();
        if (tipo !== "0" && fecha !== "0") {
            const medi = mediciones.find(med => med.id_embalse === idEmbalse && med.tipo === tipo && med.fecha === fecha);
            const val = JSON.parse(medi.json);
            const unit = medi.tipo.includes("Volumen") ? "m³" : "m²";
            const msn = medi.tipo.includes("Volumen") ? "Volumen" : "Área";
            if (change){
                $("#cota_medicion_" + idEmbalse).attr("min", medi.min);
                $("#cota_medicion_" + idEmbalse).attr("max", medi.max);
                $("#cota_medicion_" + idEmbalse).val(medi.min);
                $("#cota_medicion_text_" + idEmbalse).html(`Ingrese un número (hasta 3 decimales) del ${medi.min} al ${medi.max}`);
                $("#valor_medicion_" + idEmbalse).html(`Valor: ${val[medi.min]} ${unit}`);
            }
            else{
                if (val[$("#cota_medicion_" + idEmbalse).val()] !== undefined) {
                    $("#valor_medicion_" + idEmbalse).html(`${msn}: ${val[$("#cota_medicion_" + idEmbalse).val()]} ${unit}`);
                }
                else{
                    $("#valor_medicion_" + idEmbalse).html(`${msn}: No registrado`);
                }
            }

        }
    };


    return (
        <div>
            <div id="sidebar" className="leaflet-sidebar collapsed">
                <div className="leaflet-sidebar-tabs">
                    <ul role="tablist">
                        <li>
                            <a href="#home" role="tab" title="Información del Visor"><FontAwesomeIcon
                                icon={faCircleInfo} className="text-xl"/></a></li>
                        <li>
                            <a href="#basemap" role="tab" title="Selección Mapa Base"><FontAwesomeIcon icon={faMap}
                                                                                                       className="text-xl"/></a>
                        </li>
                        <li>
                            <a href="#buscador" role="tab" title="Buscador"><FontAwesomeIcon
                                icon={faMagnifyingGlassLocation} className="text-xl"/></a></li>
                        <li>
                            <a href="#capas" role="tab" title="Selección de Información Disponibles"><FontAwesomeIcon
                                icon={faLayerGroup} className="text-xl"/></a>
                        </li>
                    </ul>
                </div>
                <div className="leaflet-sidebar-content">
                    <div className="leaflet-sidebar-pane" id="home">
                        <h1 className="leaflet-sidebar-header">
                            Visor Proyectos
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>
                        <h2 className="h4 my-3"><b>Proyectos Batimmetría S.A.S.</b></h2>
                        <p className="h5 text-justify">En este visor podrá visualizar los recursos generados para los
                            embalses de su empresa.</p>
                        <p className="h5 text-justify">Seleccione en el mapa el pin del embalse que desee visualizar o
                            utilice el buscador para localizarlo.</p>

                    </div>
                    <div className="leaflet-sidebar-pane" id="basemap">
                        <h1 className="leaflet-sidebar-header">
                            Mapa Base
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>
                        <h2 className="h5 my-3">Seleccione el mapa base:</h2>
                        <div id="basemapContent"></div>
                    </div>
                    <div className="leaflet-sidebar-pane" id="buscador">
                        <h1 className="leaflet-sidebar-header">
                            Buscador
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>
                        <div id="buscadorContent"></div>
                    </div>
                    <div className="leaflet-sidebar-pane" id="capas">
                        <h1 className="leaflet-sidebar-header">
                            Embalses
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>

                        <p className="h5">Seleccione el embalse en el mapa o por medio del buscador.</p>

                        <div className="h-100 w-100">
                            <div className="tab-content" id="embalsesContent">
                                <Accordion defaultActiveKey={['0']} activeKey={activeKey} onSelect={setActiveKey}
                                           alwaysOpen>
                                    {embalses && embalses !== undefined &&
                                        embalses.map((embalse: Embalse) => (
                                            <Accordion.Item eventKey={`embalse_${embalse.id}`}>
                                                <Accordion.Header onClick={(e) => handleEmbalseClick(e, embalse.id)}>
                                                    <h5 className="mb-0 text-center"><b>Embalse {embalse.nombre}</b>
                                                    </h5>
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    <Tab.Container id={`tabs-embalse-${embalse.id}`}
                                                                   defaultActiveKey="bati">
                                                        <Nav variant="tabs">
                                                            <Nav.Link eventKey="bati"><b>Batimetrías</b></Nav.Link>
                                                            <Nav.Link eventKey="orto"><b>Ortofotos</b></Nav.Link>
                                                            <Nav.Link eventKey="perfil"><b>Perfiles</b></Nav.Link>
                                                            <Nav.Link eventKey="calcular"><b>Calcular</b></Nav.Link>
                                                        </Nav>
                                                        <Tab.Content>

                                                            <Tab.Pane eventKey="bati">
                                                                <div>
                                                                    {recursos && recursos !== undefined &&
                                                                        recursos.map((recurso: Recurso) => (
                                                                            recurso.id_tipo_recurso === 1 && recurso.id_embalse === embalse.id ? (

                                                                                <div className="content-file recursos">
                                                                                    <label className="switch">
                                                                                        <Form.Check type="switch"
                                                                                               id={`capa_proy_${recurso.id}`}
                                                                                               onChange={(e) => handleRecursoChange(e, recurso.id, true)}
                                                                                        />
                                                                                    </label>
                                                                                    <a>{recurso.nombre}</a>
                                                                                    <div className="d-block"></div>
                                                                                    <div>
                                                                                        <Form.Label>Transparencia: <span
                                                                                            id={`valTransp_${recurso.id}`}>0</span>%</Form.Label>
                                                                                        <Form.Range min="0" max="100"
                                                                                                    defaultValue="0"
                                                                                                    onChange={(e) => handleSliderChange(e, recurso.id, true)}
                                                                                        />
                                                                                    </div>
                                                                                    <div
                                                                                        className="d-block content-legends"
                                                                                        id={`legend_${recurso.id}`}></div>
                                                                                </div>

                                                                            ) : null
                                                                        ))}
                                                                </div>
                                                            </Tab.Pane>

                                                            <Tab.Pane eventKey="orto">
                                                                <div>
                                                                    {recursos && recursos !== undefined &&
                                                                        recursos.map((recurso: Recurso) => (
                                                                            recurso.id_tipo_recurso === 2 && recurso.id_embalse === embalse.id ? (

                                                                                <div className="content-file recursos">
                                                                                    <label className="switch">
                                                                                        <Form.Check type="switch"
                                                                                               id={`capa_proy_${recurso.id}`}
                                                                                               onChange={(e) => handleRecursoChange(e, recurso.id, true)}
                                                                                        />
                                                                                    </label>
                                                                                    <a>{recurso.nombre}</a>
                                                                                    <div className="d-block"></div>
                                                                                    <div>
                                                                                        <Form.Label>Transparencia: <span
                                                                                            id={`valTransp_${recurso.id}`}>0</span>%</Form.Label>
                                                                                        <Form.Range min="0" max="100"
                                                                                                    defaultValue="0"
                                                                                                    onChange={(e) => handleSliderChange(e, recurso.id, true)}
                                                                                        />
                                                                                    </div>
                                                                                    <div
                                                                                        className="d-block content-legends"
                                                                                        id={`legend_${recurso.id}`}></div>
                                                                                </div>

                                                                            ) : null
                                                                        ))}
                                                                </div>
                                                            </Tab.Pane>

                                                            <Tab.Pane eventKey="perfil">
                                                                <div>
                                                                    {perfiles && perfiles !== undefined &&
                                                                        perfiles.map((perfil: Perfil) => (
                                                                            perfil.id_embalse === embalse.id ? (

                                                                                <div id={`content_perfil_${perfil.id}`} className="content-file perfiles">
                                                                                    <div className="d-inline-block">
                                                                                        <label className="switch">
                                                                                            <Form.Check type="switch"
                                                                                                   id={`capa_perfil_${perfil.id}`}
                                                                                                   onChange={(e) => handlePerfilShow(e, perfil.id, false)}
                                                                                            />
                                                                                        </label>
                                                                                        <a>{perfil.nombre}</a>
                                                                                    </div>
                                                                                    <div className="d-inline-block">
                                                                                        <Button className="d-inline-block btn-1" id="editarperfil-' + response.id + '"
                                                                                                onClick={(e) => handlePerfilShow(e, perfil.id, true)}>
                                                                                            <FontAwesomeIcon icon={faChartLine} className="text-xl"/></Button>
                                                                                        <Button className="d-inline-block btn-1 ms-1" id="borrarperfil-' + response.id + '"
                                                                                                onClick={(e) => handlePerfilDelete(e, perfil.id)}>
                                                                                            <FontAwesomeIcon icon={faTrashCan} className="text-xl"/></Button>
                                                                                    </div>
                                                                                </div>

                                                                            ) : null
                                                                        ))}
                                                                </div>
                                                            </Tab.Pane>

                                                            <Tab.Pane eventKey="calcular">
                                                                <Tab.Container id={`tabs-calcular-${embalse.id}`}
                                                                               defaultActiveKey="diferencia">
                                                                    <Nav variant="tabs">
                                                                        <Nav.Link eventKey="diferencia"><b>Diferencia de
                                                                            Altura</b></Nav.Link>
                                                                        <Nav.Link eventKey="volumen"><b>Cota -
                                                                            Volumen</b></Nav.Link>
                                                                    </Nav>
                                                                    <Tab.Content>
                                                                        <Tab.Pane eventKey="diferencia">
                                                                            <Form
                                                                                onSubmit={(e) => handleDiferencia(e, embalse.id)}
                                                                            >
                                                                                <Form.Group>
                                                                                    <Form.Label className="h5">Proyecto
                                                                                        Anterior</Form.Label>
                                                                                    <Form.Select
                                                                                        id={`select-1_${embalse.id}`}>
                                                                                        {recursos && recursos !== undefined &&
                                                                                            recursos.map((recurso: Recurso) => (
                                                                                                recurso.id_tipo_recurso === 1 && recurso.id_embalse === embalse.id ? (
                                                                                                    <option
                                                                                                        value={recurso.id}>{recurso.nombre}</option>
                                                                                                ) : null
                                                                                            ))}
                                                                                    </Form.Select>
                                                                                </Form.Group>
                                                                                <Form.Group>
                                                                                    <Form.Label className="h5 mt-3">Proyecto
                                                                                        Posterior</Form.Label>
                                                                                    <Form.Select className="mb-3"
                                                                                        id={`select-2_${embalse.id}`}>
                                                                                        {recursos && recursos !== undefined &&
                                                                                            recursos.map((recurso: Recurso) => (
                                                                                                recurso.id_tipo_recurso === 1 && recurso.id_embalse === embalse.id ? (
                                                                                                    <option
                                                                                                        value={recurso.id}>{recurso.nombre}</option>
                                                                                                ) : null
                                                                                            ))}
                                                                                    </Form.Select>
                                                                                </Form.Group>
                                                                                <Button className="btn-1 mb-3" type="submit" variant="primary">Calcular
                                                                                    Diferencia</Button>
                                                                            </Form>
                                                                            <div>
                                                                                <p className="h5 titulo-generados"> Recursos Generados</p>
                                                                            </div>
                                                                            <div>
                                                                                {recursos_gen && recursos_gen !== undefined &&
                                                                                    recursos_gen.map((recurso: Recurso) => (
                                                                                        recurso.id_tipo_recurso === 1 && recurso.id_embalse === embalse.id ? (

                                                                                            <div
                                                                                                className="content-file recursos">
                                                                                                <div className="nameRecurso">
                                                                                                    <label
                                                                                                        className="switch">
                                                                                                        <Form.Check type="switch"
                                                                                                            id={`capa_proy_${recurso.id}_gen`}
                                                                                                            onChange={(e) => handleRecursoChange(e, recurso.id, false)}
                                                                                                        />
                                                                                                    </label>
                                                                                                    <a>{recurso.nombre}</a>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="d-block"></div>
                                                                                                <div>
                                                                                                    <Form.Label>Transparencia: <span
                                                                                                        id={`valTransp_${recurso.id}_gen`}>0</span>%</Form.Label>
                                                                                                    <Form.Range min="0"
                                                                                                                max="100"
                                                                                                                defaultValue="0"
                                                                                                                onChange={(e) => handleSliderChange(e, recurso.id, false)}
                                                                                                    />
                                                                                                </div>
                                                                                                <div
                                                                                                    className="d-block content-legends"
                                                                                                    id={`legend_${recurso.id}_gen`}></div>
                                                                                            </div>

                                                                                        ) : null
                                                                                    ))}
                                                                            </div>
                                                                        </Tab.Pane>
                                                                        <Tab.Pane eventKey="volumen">
                                                                            <div>
                                                                                <Form.Label className="h5">Tipo</Form.Label>
                                                                                <Form.Select id={`tipo_medicion_${embalse.id}`} onChange={(e) => handleEvalMedi(e, embalse.id, true)}>
                                                                                    <option value={"0"}>Elija Una Opcion</option>
                                                                                    {tipos[embalse.id].length>0 && tipos[embalse.id].map((tipo) => (
                                                                                        <option value={tipo}>{tipo}</option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                                <Form.Label className="h5 mt-3">Fecha</Form.Label>
                                                                                <Form.Select id={`fecha_medicion_${embalse.id}`} onChange={(e) => handleEvalMedi(e, embalse.id, true)}>
                                                                                    <option value={"0"}>Elija Una Opcion</option>
                                                                                    {fechas[embalse.id].length>0 && fechas[embalse.id].map((fecha) => (
                                                                                        <option value={fecha}>{fecha}</option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                                <Form.Label className="h5 mt-3" id={`cota_medicion_text_${embalse.id}`}>Ingrese un número (hasta 3 decimales) del min al max</Form.Label>
                                                                                <Form.Control
                                                                                    id={`cota_medicion_${embalse.id}`}
                                                                                    type="number"
                                                                                    step={0.001}
                                                                                    min="0"
                                                                                    max="1000"
                                                                                    onChange={(e) => handleEvalMedi(e, embalse.id, false)}
                                                                                />
                                                                                <p className="h5 my-3" id={`valor_medicion_${embalse.id}`}>Valor: </p>
                                                                            </div>
                                                                        </Tab.Pane>
                                                                    </Tab.Content>
                                                                </Tab.Container>
                                                            </Tab.Pane>
                                                        </Tab.Content>
                                                    </Tab.Container>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="map" style={{height: '93vh', width: '100vw'}}></div>

            <Modal show={show} onHide={handleClose} size="xl"
                   aria-labelledby="contained-modal-title-vcenter"
                   centered>
                <Modal.Header closeButton>
                    <Modal.Title>Perfil Batimetría</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div id="perfilContent">
                        <div className="col-12">
                            <img id="imgPerfil" src={imgURL} alt="" className="img-fluid"/>
                        </div>
                    </div>
                    <div id="selPerfilContent">
                        <Form.Group>
                            <Form.Label className="h5">Establezca un nombre para identificar el perfil: </Form.Label>
                            <Form.Control autoFocus type="text" className="ml-1 mb-3" id="nameperfil" defaultValue={namePerfil}
                                          placeholder="Ingrese el nombre"/>
                        </Form.Group>
                        <div>
                            {recursos.map((recurso: Recurso) => (
                                recurso.id_tipo_recurso === 1 ? (
                                    <div>
                                        <input className="mb-4 mx-1 check-perfil" type="checkbox" id={`checkperfil_${recurso.id}`}
                                               name={`${recurso.nombre}`}
                                               defaultChecked={idsPerfil.includes(recurso.id)}
                                        />
                                        <label className="h5">{`${recurso.nombre}`}</label>
                                    </div>
                                ) : null
                            ))}
                        </div>
                        <div>
                            <Button className="mt-2 btn-1" onClick={(e) => handlePerfilClick(e)}>Generar Perfil</Button>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-2" onClick={handleClose}>
                        Cerrar
                    </Button>
                    <Button className="btn-1" onClick={(e) => handleSavePerfil(e)}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}

export default Visor