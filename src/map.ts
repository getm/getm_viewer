import './css/map.css';
import * as ol from 'openlayers';

// drawing shapes
export var source = new ol.source.Vector();
var vector = new ol.layer.Vector({source: source});
vector.set('selectable', true);

// map
export const map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend([new ol.control.FullScreen()])
});

map.setView(new ol.View({
    // projection: 'EPSG:900913',
    // projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2
}));
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
 

var osmLayerGroup = new ol.layer.Group({
    layers: [osmLayer, vector]
});
var test0LayerGroup = new ol.layer.Group({
    layers: [test0Layer, vector]
});
var test1LayerGroup = new ol.layer.Group({
    layers: [test1Layer, vector]
});
// var test2LayerGroup = new ol.layer.Group({
//     layers: [test2Layer]
// });
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
    if(b % 3 == 0) {
        map.setLayerGroup(osmLayerGroup);
        console.log('osm layer');
    } else if(b % 3 == 1){
        map.setLayerGroup(test0LayerGroup);
        console.log('test layer 0');
    } else {
        map.setLayerGroup(test1LayerGroup);
        console.log('test layer 1');
    }
    b++;
};

document.getElementById('mapButton').appendChild(button);

// TODO: find way to assign this value.
export var currLayer = 'tm_prime';
var layerOptions = ['tm_prime', 'layer0', 'layer1'];

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
                if((<HTMLSelectElement>this).selectedIndex % 3 == 0) {
                    map.setLayerGroup(osmLayerGroup);
                    console.log('osm layer');
                } else if((<HTMLSelectElement>this).selectedIndex % 3 == 1){
                    map.setLayerGroup(test0LayerGroup);
                    console.log('test layer 0');
                } else {
                    map.setLayerGroup(test1LayerGroup);
                    console.log('test layer 1');
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





