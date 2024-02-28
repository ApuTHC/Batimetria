import ReactDOM from 'react-dom';
import {useEffect} from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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


import '../assets/estilosVisor.css'

const VisorPage = () => {

    let mapInitialized = false;

    useEffect(() => {
        if (!mapInitialized) {
            const map = L.map('map').setView([6.24, -75.57], 13);
            let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
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

            const unal_med = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "Campus Río",
                            "universidad": "Universidad Nacional de Colombia",
                            "ciudad": "Medellín",
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [-75.574694, 6.264771],
                                    [-75.573626, 6.264489],
                                    [-75.573202, 6.263945],
                                    [-75.573519, 6.262921],
                                    [-75.573798, 6.262793],
                                    [-75.574565, 6.262793],
                                    [-75.574833, 6.263044],
                                    [-75.574849, 6.264601],
                                    [-75.574828, 6.264697],
                                    [-75.574694, 6.264771]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "Campus Volador",
                            "universidad": "Universidad Nacional de Colombia",
                            "ciudad": "Medellín",
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [-75.576743, 6.266616],
                                    [-75.575252, 6.264953],
                                    [-75.575219, 6.259791],
                                    [-75.575734, 6.259610],
                                    [-75.579629, 6.260633],
                                    [-75.579726, 6.261796],
                                    [-75.579404, 6.262798],
                                    [-75.576743, 6.266616]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "Campus Robledo",
                            "universidad": "Universidad Nacional de Colombia",
                            "ciudad": "Medellín",
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [-75.593662, 6.27366],
                                    [-75.593201, 6.273506],
                                    [-75.592697, 6.274012],
                                    [-75.592246, 6.274092],
                                    [-75.591592, 6.273906],
                                    [-75.591216, 6.273927],
                                    [-75.59087, 6.274066],
                                    [-75.590596, 6.274375],
                                    [-75.590551, 6.274631],
                                    [-75.590637, 6.274895],
                                    [-75.590776, 6.275172],
                                    [-75.590967, 6.275471],
                                    [-75.591262, 6.275687],
                                    [-75.59149, 6.275905],
                                    [-75.591656, 6.27614],
                                    [-75.591769, 6.276329],
                                    [-75.59219, 6.276209],
                                    [-75.592332, 6.276092],
                                    [-75.592461, 6.275825],
                                    [-75.592563, 6.27562],
                                    [-75.592986, 6.275303],
                                    [-75.593281, 6.275084],
                                    [-75.593399, 6.274929],
                                    [-75.593445, 6.274727],
                                    [-75.593453, 6.274442],
                                    [-75.593295, 6.274092],
                                    [-75.593622, 6.273767],
                                    [-75.593662, 6.27366]
                                ]
                            ]
                        }
                    }
                ]
            }


            // Creamos la capa de Municipio de Antioquia
            const muni = L.geoJson(unal_med,
                {
                    onEachFeature: function (feature, layer) {
                        feature.layer = layer;
                        if (feature.properties) {
                            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                                return k + ": " + feature.properties[k];
                            }).join("<br />"), {
                                maxHeight: 200
                            });
                        }
                    }
                }
            ).addTo(map);

            // Añadimos la capa de municipio al control de búsqueda con los campos que queremos filtrar y que se muestrarán en la busqueda
            searchCtrl.indexFeatures(muni.toGeoJSON(), ['name', 'universidad']);

        }
    }, []);

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
                            <div className="tab-content" id="embalsesContent"></div>
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

export default VisorPage