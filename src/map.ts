import './css/map.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import {globals} from './globals';
import {setupShapes} from './getm';

const BASE_MAP_LAYER = 0;
const AIRPORTS_LAYER = 1;
const ROADS_LAYER = 2;
const STATE_ROUTES_LAYER = 3;
const SHAPES_LAYER = 4;  // IMPORTANT: SET THIS AS THE LAST LAYER >__>

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

if(globals.debug)
      map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize());

const test0Layer = new ol.layer.Tile({source: new ol.source.OSM()});
const test1Layer = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'AujpfmQXbCtjzvhFvRij8xuM4AMDhnOjUec2XypfwBTDMyWAR8qr_y2WyHrWX_OG',
        imagerySet: 'Aerial',
    })
});
const test2Layer = new ol.layer.Tile({
    source: new ol.source.Stamen({layer: 'watercolor'})
});

export var shapeLayer;

var shapeLayerOptions = ['tm_prime', 'tm_prod', 'tm_release', 'all'];
var shapeLayers = {};

function populateMap() {
    var mapLayerOptions = ['layer0', 'layer1', 'layer2'];   
    var currMapLayer = mapLayerOptions[0]; 
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
             
            if((<HTMLSelectElement>this).selectedIndex % 3 == 0) {
                map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test0Layer);
            } else if((<HTMLSelectElement>this).selectedIndex % 3 == 1){
                map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test1Layer);
            } else {
                map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test2Layer);
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

function populateShape(){
    // generate the sources and layers for the shapes
    for(var i = 0; i < shapeLayerOptions.length; i++) {
        var source = new ol.source.Vector();
        var vector = new ol.layer.Vector({source: source});
        vector.set('selectable', true);
        vector.set('name', shapeLayerOptions[i]);
        shapeLayers[shapeLayerOptions[i]] = vector;
    }

    shapeLayer = shapeLayers[shapeLayerOptions[0]];
    var shapeLayerSelect = document.getElementsByClassName('shape-layer-select');

    // make all options change at the same time
    var $set = $('.shape-layer-select');
    $set.change(function(){
        $set.not(this).val(this.value);
    });    

    for (var i = 0; i < shapeLayerSelect.length; i++) {
        for( var j = 0; j < shapeLayerOptions.length; j++) {
            var opt = document.createElement('option');
            opt.innerHTML=shapeLayerOptions[j];
            opt.value = shapeLayerOptions[j];

            // TODO: make this less hacky >__>
            if(shapeLayerSelect[i].id == 'layerinfolayer' && j == shapeLayerOptions.length -1) 
                continue;

            shapeLayerSelect[i].appendChild(opt.cloneNode(true));
        }
        (<HTMLSelectElement>shapeLayerSelect[i]).value = shapeLayer.get('name');
        (<HTMLSelectElement>shapeLayerSelect[i]).onchange = function(){
            // set other layers false and set this layer true, unless option is all, which case all true
            if((<HTMLSelectElement>this).selectedIndex < (<HTMLSelectElement>this).length -1) {
                shapeLayer = shapeLayers[(<HTMLSelectElement>this).value];
                for(var j = 0; j < (<HTMLSelectElement>this).length - 1; j++ ){
                    map.getLayerGroup().getLayers().getArray()[SHAPES_LAYER + j].setVisible(false);
                }
                map.getLayerGroup().getLayers().getArray()[SHAPES_LAYER + (<HTMLSelectElement>this).selectedIndex].setVisible(true);
            } else  {
                shapeLayer = shapeLayers[shapeLayerOptions[0]]; // all is set to default value
                for(var j = 0; j < (<HTMLSelectElement>this).length - 1; j++ ){
                    map.getLayerGroup().getLayers().getArray()[SHAPES_LAYER + j].setVisible(true);
                }
            }
            setupShapes();     
        };        
    }
}

export function populateLayers(){
    populateMap();
    populateShape();
    var layers = [test1Layer, new ol.layer.Vector(), new ol.layer.Vector(), new ol.layer.Vector()]
    for(var j = 0; j < Object.keys(shapeLayers).length - 1; j++ ){
        layers.push(shapeLayers[shapeLayerOptions[j]]);
    }
    map.setLayerGroup(new ol.layer.Group({
        layers: layers
    }));
}
