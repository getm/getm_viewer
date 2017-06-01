import './css/map.css';
import * as ol from 'openlayers';
import {debug} from './config';
import * as $ from 'jquery';

const BASE_MAP_LAYER = 0;
const AIRPORTS_LAYER = 1;
const ROADS_LAYER = 2;
const STATE_ROUTES_LAYER = 3;
const SHAPES_LAYER = 4;

var wfs_airports_source = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: 'http://localhost:9002/' +
    'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_airports&maxFeatures=50' + '&outputFormat=GML3',
    strategy: ol.loadingstrategy.bbox
});

var wfs_roads_source = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: 'http://localhost:9002/' + 'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_roads' + '&outputFormat=GML3',
    strategy: ol.loadingstrategy.bbox
});

var wfs_state_routes_source = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: 'http://localhost:9002/' + 'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_state_routes' + '&outputFormat=GML3',
    strategy: ol.loadingstrategy.bbox
});

var wfs_airports_layer = new ol.layer.Vector({
    source: wfs_airports_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
        })
    }),
    visible: true
});

var wfs_roads_layer = new ol.layer.Vector({
    source: wfs_roads_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 1.0)',
            width: 2
        })
    }),
    visible: true
});

var wfs_state_routes_layer = new ol.layer.Vector({
    source: wfs_state_routes_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 255, 0, 1.0)',
            width: 2
        })
    }),
    visible: true
});

// map
export const map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend([new ol.control.FullScreen()])
});

map.setView(new ol.View({
    // projection: 'EPSG:900913',
    projection: 'EPSG:4326',
    maxZoom: 19,
    zoom: 12
    // center: [0, 0],
    // zoom: 3
}));

if(debug)
      map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize());

var styles = [
    'Road',
    'Aerial',
    'AerialWithLabels',
    'collinsBart',
    'ordnanceSurvey'
];

const osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});
const test0Layer = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'AujpfmQXbCtjzvhFvRij8xuM4AMDhnOjUec2XypfwBTDMyWAR8qr_y2WyHrWX_OG',
        imagerySet: styles[1],
    })
});
const test1Layer = new ol.layer.Tile({
    source: new ol.source.Stamen({layer: 'watercolor'})
});
export var shapeSource;
var shapeLayerOptions = ['tm_prime', 'tm_prod', 'tm_release'];
var shapeLayers = {};
export var shapeSources = {};
for(var i = 0; i < shapeLayerOptions.length; i++) {
    var source = new ol.source.Vector();
    shapeSources[shapeLayerOptions[i]] = source;
    var vector = new ol.layer.Vector({source: source});
    vector.set('selectable', true);
    shapeLayers[shapeLayerOptions[i]] = vector;
}

shapeSource = shapeSources[shapeLayerOptions[0]];
var shapeLayer = shapeLayers[shapeLayerOptions[0]];

var layers = [osmLayer, new ol.layer.Vector(), new ol.layer.Vector(), new ol.layer.Vector(), shapeLayer];

var layerGroup = new ol.layer.Group({
    layers: layers
});

// TODO: find way to assign this value.
var mapLayerOptions = ['layer0', 'layer1', 'layer2'];
export var currMapLayer = mapLayerOptions[0];
export var currShapeLayer = shapeLayerOptions[0];

function populateMap() {
    var mapLayerSelect = document.getElementsByClassName('layer-select');
    var mapSelect = document.createElement('select');
    for( var i = 0; i < mapLayerOptions.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML=mapLayerOptions[i];
        opt.value = mapLayerOptions[i];
        mapSelect.appendChild(opt);
    }
    mapSelect.value = currMapLayer;

    for(var i = 0; i < mapLayerSelect.length; i++) {
        mapLayerSelect[i].innerHTML = ""; // clear contents
        var cln = mapSelect.cloneNode(true);
        (<HTMLSelectElement>cln).onchange = function(){
            currMapLayer = (<HTMLSelectElement>this).value; 
             
            console.log(currMapLayer);
            if((<HTMLSelectElement>this).selectedIndex % 3 == 0) {
                console.log('osm layer ' + (<HTMLSelectElement>this).selectedIndex);
                map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, osmLayer);
            } else if((<HTMLSelectElement>this).selectedIndex % 3 == 1){
                console.log('test layer 0 ' + (<HTMLSelectElement>this).selectedIndex);
                map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test0Layer);
            } else {
                console.log('test layer 1 ' + (<HTMLSelectElement>this).selectedIndex );
                map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test1Layer);
            }
        };
        mapLayerSelect[i].appendChild(cln);
    }

    // toggle airports
    $('#airports_checkbox').click(function(){
        if((<HTMLInputElement>document.getElementById('airports_checkbox')).checked) {
            map.getLayerGroup().getLayers().setAt(AIRPORTS_LAYER, wfs_airports_layer);
        } else {
            map.getLayerGroup().getLayers().setAt(AIRPORTS_LAYER, new ol.layer.Vector());
        }
    });

    // toggle roads
    $('#roads_checkbox').click(function(){
        if((<HTMLInputElement>document.getElementById('roads_checkbox')).checked) {
            map.getLayerGroup().getLayers().setAt(ROADS_LAYER, wfs_roads_layer);
        } else {
            map.getLayerGroup().getLayers().setAt(ROADS_LAYER, new ol.layer.Vector());
        }
    });

    // toggle state routes
    $('#state_routes_checkbox').click(function(){
        if((<HTMLInputElement>document.getElementById('state_routes_checkbox')).checked) {
            map.getLayerGroup().getLayers().setAt(STATE_ROUTES_LAYER, wfs_state_routes_layer);
        } else {
            map.getLayerGroup().getLayers().setAt(STATE_ROUTES_LAYER, new ol.layer.Vector());
        }
    });
}

// let asdf = (window as any).asdf; 
// if(!asdf) {
//     (window as any).asdf = {};
//     asdf = (window as any).asdf;
// }
// asdf['b'] = 'B';
// console.log(asdf);


function populateShape(){
    // shape layers
    var shapeLayerSelect = document.getElementsByClassName('shape-layer-select');
    var shapeSelect = document.createElement('select');
    for( var i = 0; i < shapeLayerOptions.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML=shapeLayerOptions[i];
        opt.value = shapeLayerOptions[i];
        shapeSelect.appendChild(opt);
    }
    shapeSelect.value = currShapeLayer;

    for(var i = 0; i < shapeLayerSelect.length; i++) {
        shapeLayerSelect[i].innerHTML = ""; // clear contents
        var cln = shapeSelect.cloneNode(true);
        (<HTMLSelectElement>cln).onchange = function(){
            currShapeLayer = (<HTMLSelectElement>this).value; 
            console.log(currShapeLayer);

            console.log('shape layer ' + (<HTMLSelectElement>this).selectedIndex);
            map.getLayerGroup().getLayers().setAt(SHAPES_LAYER, shapeLayers[shapeLayerOptions[(<HTMLSelectElement>this).selectedIndex]]);
            shapeSource = shapeSources[shapeLayerOptions[(<HTMLSelectElement>this).selectedIndex]];
            console.log(shapeSource);
        };
        shapeLayerSelect[i].appendChild(cln);
    }
}
export function populateLayers(){
    populateMap();
    populateShape();

    // default: 
    map.setLayerGroup(layerGroup);
    console.log('osm layer');
}



