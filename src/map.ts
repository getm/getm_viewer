import './map.css';
import './getm.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import 'jqueryui';
//import {getmPopup} from './getm';
import {x} from './sig';
// var read = new XMLHttpRequest();
// read.open('GET', 'nav.html', false);
// read.send();
// document.getElementById('nav').innerHTML=read.responseText;
console.log(x);
var container = document.getElementById('popup');

// overlay for popup messages
const overlay = new ol.Overlay({
    element: container,
    autoPan: true
});
overlay.setPosition(undefined);

// drawing shapes
var source = new ol.source.Vector({wrapX: false});
var vector = new ol.layer.Vector({source: source});
vector.set('selectable', true);
// map
export const map = new ol.Map({target: 'map', overlays:[overlay]});
map.setView(new ol.View({
    center: [0, 0],
    zoom: 2
}));

const osmSource = new ol.source.OSM();
const osmLayer = new ol.layer.Tile({source: osmSource});

const USGSTopoSource = new ol.source.OSM({
    url : "http://129.206.228.72/cached/osm/service/",
})
const USGSTopoLayer = new ol.layer.Tile({source: USGSTopoSource});

var selectStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#ffccff',
        })
});


map.addLayer(osmLayer);
//map.addLayer(USGSTopoLayer);
map.addLayer(vector);
map.addInteraction(new ol.interaction.Select({
    layers: function(layer) {
        return layer.get('selectable') == true;
    },
    style: [selectStyle]

}));
// TODO: wrap this in a method/button thing
var draw;
function drawFunction() {
    if(draw == undefined) {
        var value = 'Circle';
        draw = new ol.interaction.Draw({
            source: source,
            type: "Circle",
            geometryFunction: ol.interaction.Draw.createBox(),
        });
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
}

function drawCircle() {
    if(draw == undefined) {
        var value = 'Circle';
        draw = new ol.interaction.Draw({
            source: source,
            type: "Circle"
        });
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
}

function drawFreeform() {
    if(draw == undefined) {
        var value = 'Polygon';
        draw = new ol.interaction.Draw({
            source: source,
            // type: "LineString",
            type: "Polygon",
            freehand: true
        });
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
}

function drawPolyline() {
    if(draw == undefined) {
        var value = 'Polygon';
        draw = new ol.interaction.Draw({
            source: source,
            type: "LineString"
        });
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
}

source.on('addfeature', function(evt){
    draw.setActive(false);
    draw = undefined;

document.getElementById('debug').innerHTML = source.getFeatures().entries.toString();
    
    // not sure what this means
    // document.getElementById('debug').innerHTML = source.getFeatures().pop().getGeometry().getExtent().toString() + "\n" 
    // + source.getFeatures().pop().getStyle();
});



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

// var modalBody = document.getElementById("modal-body");

// // read popup from file
// var read = new XMLHttpRequest();
// read.open('GET', 'getm.html', false);
// read.send();
// modalBody.innerHTML=read.responseText;


// opens up the overlay
var btn = document.createElement('button');
btn.innerText = 'popup button';
document.getElementById('button').appendChild(btn);
//btn.onclick = getmPopup;//getm.getmPopup;//getmPopup; //myFunc;

// draw button
var drawRectButton = document.createElement('button');
drawRectButton.innerText = 'rectangle';
document.getElementById('drawRect').appendChild(drawRectButton);
drawRectButton.onclick = drawFunction; //myFunc;

var drawCircButton = document.createElement('button');
drawCircButton.innerText = 'circle';
document.getElementById('drawCirc').appendChild(drawCircButton);
drawCircButton.onclick = drawCircle; //myFunc;

var drawFreeButton = document.createElement('button');
drawFreeButton.innerText = 'freeform';
document.getElementById('drawFreeform').appendChild(drawFreeButton);
drawFreeButton.onclick = drawFreeform; //myFunc;

var drawLineButton = document.createElement('button');
drawLineButton.innerText = 'polyline';
document.getElementById('drawPolyline').appendChild(drawLineButton);
drawLineButton.onclick = drawPolyline; //myFunc;

// closing stuff -- not in use rn
var closer = document.getElementById('popup-closer');
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};





