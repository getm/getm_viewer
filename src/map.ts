import './map.css';
import * as ol from 'openlayers';
// import * as $ from 'jquery';
// import 'jqueryui';

// var container = document.getElementById('popup');

// // overlay for popup messages
// const overlay = new ol.Overlay({
//     element: container,
//     autoPan: true
// });
// overlay.setPosition(undefined);

// drawing shapes
export var source = new ol.source.Vector({wrapX: false});
var vector = new ol.layer.Vector({source: source});
vector.set('selectable', true);
// map
//export const map = new ol.Map({target: 'map', overlays:[overlay]});
export const map = new ol.Map({target: 'map'});
map.setView(new ol.View({
    center: [0, 0],
    zoom: 2
}));

const osmSource = new ol.source.OSM();
const osmLayer = new ol.layer.Tile({source: osmSource});

// const USGSTopoSource = new ol.source.OSM({
//     url : "http://129.206.228.72/cached/osm/service/",
// })
// const USGSTopoLayer = new ol.layer.Tile({source: USGSTopoSource});

map.addLayer(osmLayer);
//map.addLayer(USGSTopoLayer);
map.addLayer(vector);

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





