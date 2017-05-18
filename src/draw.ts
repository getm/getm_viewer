// TODO: wrap this in a method/button thing
import {source, map} from './map';
import * as $ from 'jquery';
import 'jqueryui';
import * as ol from 'openlayers';
import './draw.css';
import './getm.css';

// go over which i need
var draw;
var selectedFeatureID;
var id = 0;
export var features = {};

// TODO: do something about the draw functions? really repetitive code
function drawRectangle() {
    if(draw == undefined) {
        var value = 'Circle';
        draw = new ol.interaction.Draw({
            source: source,
            type: "Circle",
            geometryFunction: ol.interaction.Draw.createBox(),
        });
        draw.on('drawend', function(e) {
            e.feature.setProperties({
                'id': 'box'+id
            });
            features['box'+id] = e.feature;
            id++;
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
        draw.on('drawend', function(e) {
            e.feature.setProperties({
                'id': 'circle'+id
            });
            features['circle'+id] = e.feature;
            id++;
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
        draw.on('drawend', function(e) {
            e.feature.setProperties({
                'id': 'freeform'+id
            });
            features['freeform'+id] = e.feature;
            id++;
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
        draw.on('drawend', function(e) {
            e.feature.setProperties({
                'id': 'polyline'+id
            }),
            features['polyline'+id] = e.feature;
            id++;
        });
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
}

function drawDelete() {
    //source.removeFeature(map.getLayers().item(0).get);
    if(source.getFeatures() == null || source.getFeatures().length == 0) {
        alert("no features");
        return;
    } else {
        selectInteraction.setActive(false);
        deleteInteraction.setActive(true);
    }
}

//TODO: clean up select interaction and delete interaction 
{
    var selectInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        }
    });
    map.addInteraction(selectInteraction);
    var deleteInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        }
    });

    deleteInteraction.getFeatures().on('add', function (e){
        selectedFeatureID = e.element.get('id');
        // remove all
        delete features[selectedFeatureID];
        source.removeFeature(e.element);
        deleteInteraction.getFeatures().remove(e.element);
        selectInteraction.getFeatures().remove(e.element);

        // debugging statements
        document.getElementById('debug').innerHTML = "deleting: " + selectedFeatureID 
            + '<br/>num of objs: ' + Object.keys(features).length
            + '<br/>' + Object.keys(features).toString();
    });
    deleteInteraction.setActive(false);
    map.addInteraction(deleteInteraction);
}

// TODO: organize this remove/add feature blurb
{
    source.on('removefeature', function(e){
        // alert('removed');
        selectInteraction.setActive(true);
        deleteInteraction.setActive(false);

    });

    source.on('addfeature', function(evt){
        draw.setActive(false);
        draw = undefined;
        // selectInteraction.getFeatures().clear();
        //document.getElementById('debug').innerHTML = source.getFeatures().entries().next().value[1].getGeometryName().toString();
        // not sure what this means
        document.getElementById('debug').innerHTML = 'adding: ' + source.getFeatures().pop().get('id')
            + '<br/>num of objs: ' + Object.keys(features).length
            + '<br/>' + Object.keys(features).toString()
            + '<br/>' + source.getFeatures().pop().getGeometry().getExtent().toString();
    });
}

// I call hidePopup once... do i need???
function hidePopup() {
    var drawPopupText = document.getElementById("drawPopupText");
    drawPopupText.classList.toggle("show");
    $('#drawPopup').zIndex(-1);
}

// TODO: something about organizing this
function setup() {
    var app = document.getElementById("app");
    var drawDiv = document.createElement('div');
    var read = new XMLHttpRequest();
    read.open('GET', 'draw.html', false);
    read.send();
    drawDiv.innerHTML = read.responseText;
    app.appendChild(drawDiv);
    drawDiv.classList.toggle('show');
    drawButtons();

    var drawCloseBtn = document.createElement('button');
    drawCloseBtn.className = "close";
    drawCloseBtn.innerHTML = "&times;";
    document.getElementById("draw-close").appendChild(drawCloseBtn);
    drawCloseBtn.onclick = hidePopup;
}

export function drawPopup() {
    var drawPopupText = document.getElementById('drawPopupText')
    if(drawPopupText.classList.toggle("show")) {
        // move around the popup
        $("#drawPopup").draggable();
        $("#drawPopup").resizable();
        $("#drawPopup").zIndex(2);
    } 
}

// TODO: disable all butttons except current selected one
function disableButtons() {

}

// draw buttons
function drawButtons() {
    var drawRectButton = document.createElement('button');
    drawRectButton.innerText = 'rectangle';
    document.getElementById('drawRect').appendChild(drawRectButton);
    drawRectButton.onclick = drawRectangle; 

    var drawCircButton = document.createElement('button');
    drawCircButton.innerText = 'circle';
    document.getElementById('drawCirc').appendChild(drawCircButton);
    drawCircButton.onclick = drawCircle;

    var drawFreeButton = document.createElement('button');
    drawFreeButton.innerText = 'freeform';
    document.getElementById('drawFreeform').appendChild(drawFreeButton);
    drawFreeButton.onclick = drawFreeform; 

    var drawLineButton = document.createElement('button');
    drawLineButton.innerText = 'polyline';
    document.getElementById('drawPolyline').appendChild(drawLineButton);
    drawLineButton.onclick = drawPolyline; 

    var deleteButton = document.createElement('button');
    deleteButton.innerText = 'delete';
    document.getElementById('delete').appendChild(deleteButton);
    deleteButton.onclick = drawDelete;
}

setup();