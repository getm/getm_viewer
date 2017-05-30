import './css/map.css';
import * as ol from 'openlayers';
import {debug} from './config';
import * as $ from 'jquery';
// drawing shapes
export var source = new ol.source.Vector();
var vector = new ol.layer.Vector({source: source});
vector.set('selectable', true);
const BASE_MAP_LAYER = 0;
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
            // color: 'rgba(0, 0, 0, 1.0)',
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


const osmSource = new ol.source.OSM();
const osmLayer = new ol.layer.Tile({source: osmSource});
const test0Layer = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'AujpfmQXbCtjzvhFvRij8xuM4AMDhnOjUec2XypfwBTDMyWAR8qr_y2WyHrWX_OG',
        imagerySet: styles[1],
    })
});
const test1Layer = new ol.layer.Tile({
    source: new ol.source.Stamen({layer: 'watercolor'})
});


// TODO: configure this to GML2(1.0.0) or GML3(1.1.0)
var aSource = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: 'http://localhost:9002/' +
    'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_airports&maxFeatures=50' + '&outputFormat=GML3',
    strategy: ol.loadingstrategy.bbox
});

var aLayer = new ol.layer.Vector({
    source: aSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 255, 1.0)',
        width: 2
        })
    })
});


// TODO: split vector into different subcategories. depending on the layer we are on....?
// maybe keep vector as the unassigned ones and the other layers as the actually assigned oens...? or create new assigned ones. 
var osmLayerGroup = new ol.layer.Group({
    layers: [osmLayer, vector, wfs_airports_layer, new ol.layer.Vector()]
});
var test0LayerGroup = new ol.layer.Group({
    layers: [test0Layer, vector]
});
var test1LayerGroup = new ol.layer.Group({
    layers: [test1Layer, vector]
});
var test2LayerGroup = new ol.layer.Group({
    layers: [osmLayer,vector,wfs_airports_layer, wfs_roads_layer]
});

// var test3LayerGroup = new ol.layer.Group({
//     layers: [test3Layer]
// });
var b = 0;

map.setLayerGroup(osmLayerGroup);
console.log('osm layer');
//map.addLayer(osmLayer);
// map.addLayer(testLayer);
// map.addLayer(vector);

var button = document.createElement('button');
button.innerHTML = "switch map";
button.onclick = function(){
    if(b % 4 == 0) {
        map.setLayerGroup(osmLayerGroup);
        console.log('osm layer');
    } else if(b % 4 == 1){
        map.setLayerGroup(test0LayerGroup);
        console.log('test layer 0');
    } else if(b % 4 == 2){
        map.setLayerGroup(test1LayerGroup);
        console.log('test layer 1');
    } else {
        map.setLayerGroup(test2LayerGroup);
        console.log('test layer 2');
    }
    b++;
};

document.getElementById('mapButton').appendChild(button);

// TODO: find way to assign this value.
export var currLayer = 'tm_prime';
var layerOptions = ['tm_prime', 'layer0', 'layer1', 'layer2'];

// function setLayer() {
//     switch(currLayer) {
//         case 'tm_prime': 
//     }
// }

export function populateLayers(){
    var layerSelect = document.getElementsByClassName('layer-select');

    var select = document.createElement('select');
    for( var i = 0; i < layerOptions.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML=layerOptions[i];
        opt.value = layerOptions[i];
        select.appendChild(opt);
    }
    select.value = currLayer;

    for(var i = 0; i < layerSelect.length; i++) {
        layerSelect[i].innerHTML = ""; // clear contents
        var cln = select.cloneNode(true);
        (<HTMLSelectElement>cln).onchange = function(){
            currLayer = (<HTMLSelectElement>this).value; 
             
            console.log(currLayer);
                if((<HTMLSelectElement>this).selectedIndex % 4 == 0) {
                    console.log('osm layer ' + (<HTMLSelectElement>this).selectedIndex);
                    map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, osmLayerGroup);
                    console.log('osm layer');
                } else if((<HTMLSelectElement>this).selectedIndex % 4 == 1){
                    console.log('test layer 0 ' + (<HTMLSelectElement>this).selectedIndex);
                    map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test0LayerGroup);
                    console.log('test layer 0');
                } else if((<HTMLSelectElement>this).selectedIndex % 4 == 2){
                    console.log('test layer 1 ' + (<HTMLSelectElement>this).selectedIndex );
                    map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, test1LayerGroup);
                } else {
                    map.setLayerGroup(test2LayerGroup);
                    console.log('test layer 2');
                }

        };
        layerSelect[i].appendChild(cln);
    }
}

// var container = document.getElementById('popup');

// // overlay for popup messages
// const overlay = new ol.Overlay({
//     element: container,
//     autoPan: true
// });
// overlay.setPosition(undefined);
//export const map = new ol.Map({target: 'map', overlays:[overlay]});
// const USGSTopoSource = new ol.source.OSM({
//     url : "http://129.206.228.72/cached/osm/service/",
// })
// const USGSTopoLayer = new ol.layer.Tile({source: USGSTopoSource});
//map.addLayer(USGSTopoLayer);

// overlay in the map -- not in use rn
// function myFunc () {
//     if(overlay.getPosition() == undefined) {
//         overlay.setPosition(map.getView().getCenter());
//         var content = document.getElementById('popup-content');
//         var read = new XMLHttpRequest();
//         read.open('GET', 'getm.html', false);
//         read.send();
//         content.innerHTML=read.responseText;
//     }
// }

// closing stuff -- not in use rn
// var closer = document.getElementById('popup-closer');
// closer.onclick = function() {
//     overlay.setPosition(undefined);
//     closer.blur();
//     return false;
// };





