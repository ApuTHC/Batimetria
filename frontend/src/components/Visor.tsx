import {useEffect} from 'react';
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
    faCalculator,
    faCaretLeft
} from '@fortawesome/free-solid-svg-icons';
import 'esri-leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import $ from 'jquery';
import '../assets/L.switchBasemap.js';
import '../assets/L.switchBasemap.css'
import '../assets/leaflet.fusesearch.css'
import '../assets/leaflet.fusesearch.js'
import * as WMS from "leaflet.wms";
// import { wms } from  '../assets/leaflet.wms.js'


import '../assets/estilosVisor.css'
import {toast} from "react-hot-toast";

import {Accordion, Tab, Nav, Form} from 'react-bootstrap';
import {Embalse, Recurso} from "../Interfaces.ts";
import {Source} from "leaflet.wms";


interface Props {
    recursos: []
    embalses: []
}

const Visor = ({recursos, embalses}: Props) => {

    console.log(embalses)
    console.log(recursos)

    let mapInitialized = false;
    let map : L.Map;

    useEffect(() => {
        if (!mapInitialized) {
            map = L.map('map').setView([6.24, -75.57], 11);
            const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            mapInitialized = true;

            const sidebar = L.control.sidebar({
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
            $(".content .header .close").remove();

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
                            // layer.bindPopup(popupEmbalses);
                        }
                    }
                )
                    // .bindPopup(popupEmbalses)
                    .addTo(embalsesLayer)
            }
            embalsesLayer.addTo(map);
            console.log(embalsesLayer.toGeoJSON());
            // searchCtrl.indexFeatures(embalsesLayer.toGeoJSON(), ['nombre']);

        }
    }, []);

    console.log(embalses)
    console.log(recursos)

    let obj_capas_recursos : {[key: string]: [any, string, boolean] } = {};

    const handleRecursoChange = (event: React.ChangeEvent<HTMLInputElement>, resourceId: number) => {
        const isChecked = event.target.checked;
        console.log(`El recurso con ID ${resourceId} fue cambiado. Está ${isChecked ? 'seleccionado' : 'deseleccionado'}.`);
        if (isChecked){
            if (obj_capas_recursos[resourceId] === undefined){
                console.log(`El recurso con ID ${resourceId} no existe en el mapa.`);
                const idAux = resourceId - 1;
                console.log(recursos[idAux])
                const layerWMS = WMS.source(recursos[idAux].ruta, {
                    attribution: "",
                    useCors: false,
                    opacity: 1,
                    maxZoom: 25,
                    format: 'image/png',
                    layers: recursos[idAux].nombre,
                    transparent: true,
                    version: '1.3.0',
                    info_format: 'text/html',
                    env: "nn"
                });

                const capa =  layerWMS.getLayer(recursos[idAux].capa).addTo(map);
                const legend = "http://localhost:8080/geoserver/prueba/wms" + "?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" + "prueba:MDT_Diciembre_2019";
                $("#legend_"+resourceId).append('<div className="legend_capa"><img src="'+ legend +'" alt="Leyenda" /></div>');
                obj_capas_recursos[resourceId] = [capa , legend, true];
            }
            else{
                map.addLayer(obj_capas_recursos[resourceId][0]);
                $('#legend_'+resourceId).append('<div className="legend_capa"><img src="'+ obj_capas_recursos[resourceId][1] +'" alt="Leyenda" /></div>');
                obj_capas_recursos[resourceId][2] = true;
            }
        }
        else {
            map.removeLayer(obj_capas_recursos[resourceId][0]);
            $('#legend_'+resourceId).empty();
            obj_capas_recursos[resourceId][2] = false;
        }
        // toggleDatosProyectos(resourceId, isChecked);
    };

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>, resourceId: number) => {
        const value = event.target.value;
        console.log(`El recurso con ID ${resourceId} cambió su transparencia a ${value}.`);
        $(`#valTransp_${resourceId}`).text(value);
        var opacidad = (100 - parseInt(value)) / 100;
        if (obj_capas_recursos[resourceId] !== undefined){
            if (obj_capas_recursos[resourceId][2]) {
                obj_capas_recursos[resourceId][0].setOpacity(opacidad);
            }
        }
    };


    return (
        <div>
            <div id="sidebar" className="leaflet-sidebar collapsed">
                <div className="leaflet-sidebar-tabs">
                    <ul role="tablist">
                        <li><a href="#home" role="tab" title="Información del Visor"><FontAwesomeIcon
                            icon={faCircleInfo} className="text-xl"/></a></li>
                        <li><a href="#basemap" role="tab" title="Selección Mapa Base"><FontAwesomeIcon icon={faMap}
                                                                                                       className="text-xl"/></a>
                        </li>
                        <li><a href="#buscador" role="tab" title="Buscador"><FontAwesomeIcon
                            icon={faMagnifyingGlassLocation} className="text-xl"/></a></li>
                        <li><a href="#capas" role="tab" title="Selección de Información Disponibles"><FontAwesomeIcon
                            icon={faLayerGroup} className="text-xl"/></a></li>
                        <li><a href="#batimetria" role="tab" title="Batimetría"><FontAwesomeIcon icon={faCalculator}
                                                                                                 className="text-xl"/></a>
                        </li>
                    </ul>
                </div>
                <div className="leaflet-sidebar-content">
                    <div className="leaflet-sidebar-pane" id="home">
                        <h1 className="leaflet-sidebar-header">
                            Visor Proyectos
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>
                        <h4 className="text-justify"><b>Proyectos Batimmetría S.A.S.</b></h4>
                        <p className="h5">En este visor podrá visualizar los recursos generados para los
                            embalses de su empresa.</p>
                        <p className="h5">Seleccione en el mapa el pin del embalse que desee visualizar o
                            utilice el buscador para localizarlo.</p>

                    </div>
                    <div className="leaflet-sidebar-pane" id="basemap">
                        <h1 className="leaflet-sidebar-header">
                            Mapa Base
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>
                        <h4>Seleccione el mapa base:</h4>
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
                                <Accordion defaultActiveKey={['0']} alwaysOpen>
                                    {embalses && embalses !== undefined &&
                                        embalses.map((embalse: Embalse) => (
                                            <Accordion.Item eventKey={`${embalse.id}`}>
                                                <Accordion.Header>
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
                                                        </Nav>
                                                        <Tab.Content>
                                                            <Tab.Pane eventKey="bati">
                                                                <div>
                                                                    {recursos && recursos !== undefined &&
                                                                        recursos.map((recurso: Recurso) => (
                                                                            recurso.id_tipo_recurso === 1 && recurso.id_embalse === embalse.id ? (

                                                                                <div className="content-file">
                                                                                    <label className="switch">
                                                                                        <input type="checkbox"
                                                                                               id={`capa_proy_${recurso.id}`}
                                                                                               onChange={(e) => handleRecursoChange(e, recurso.id)}
                                                                                        />
                                                                                        <span
                                                                                            className="slider round"></span>
                                                                                    </label>
                                                                                    <a>{recurso.nombre}</a>
                                                                                    <div className="d-block"></div>
                                                                                    <div>
                                                                                        <Form.Label>Transparencia: <span
                                                                                            id={`valTransp_${recurso.id}`}>0</span>%</Form.Label>
                                                                                        <Form.Range min="0" max="100"
                                                                                                    defaultValue="0"
                                                                                                    id={`transp-file_proy_${recurso.id}`}
                                                                                                    onChange={(e) => handleSliderChange(e, recurso.id)}
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

                                                                                <div className="content-file">
                                                                                    <label className="switch">
                                                                                        <input type="checkbox"
                                                                                               id={`capa_proy_${recurso.id}`}
                                                                                               onChange={(e) => handleRecursoChange(e, recurso.id)}
                                                                                        />
                                                                                        <span
                                                                                            className="slider round"></span>
                                                                                    </label>
                                                                                    <a>{recurso.nombre}</a>
                                                                                    <div className="d-block"></div>
                                                                                    <div>
                                                                                        <Form.Label>Transparencia: <span
                                                                                            id={`valTransp_${recurso.id}`}>0</span>%</Form.Label>
                                                                                        <Form.Range min="0" max="100"
                                                                                                    defaultValue="0"
                                                                                                    id={`transp-file_proy_${recurso.id}`}
                                                                                                    onChange={(e) => handleSliderChange(e, recurso.id)}
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
                                                                <div id={`nav-perfil-${embalse.id}`}>perfil</div>
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
                    <div className="leaflet-sidebar-pane" id="batimetria">
                        <h1 className="leaflet-sidebar-header">
                            Visor Proyectos
                            <span className="leaflet-sidebar-close"><FontAwesomeIcon icon={faCaretLeft}/></span>
                        </h1>
                        <h2>Embalse Calderas</h2>
                        <div id="content-proyectos" className="container-fluid tab-content"></div>

                        <div id="content-resultados" className="container-fluid tab-content">

                        </div>
                    </div>
                </div>
            </div>

            <div id="map" style={{height: '93vh', width: '100vw'}}></div>
        </div>
    )
}

export default Visor