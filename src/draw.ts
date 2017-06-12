import {shapeLayer, map} from './map';
import * as $ from 'jquery';
import * as ol from 'openlayers';
import './css/draw.css';
import {setupShapes} from './getm';
import {globals, windowSetup} from './globals';
import {Shape} from './Shape';

// go over which i need
var draw;
var deleteInteraction;
var radioSelection;

var shapeCounts = {
    'rectangle': 0,
    'circle': 0,
    'ellipse': 0,
    'freeform': 0,
    'polyline': 0,
    'polygon': 0
}

function drawShape(shapeType) {
    if(map.getInteractions().getArray().indexOf(draw) != -1) {
        draw.setActive(false);
        map.removeInteraction(draw);
    }
    var shapeSource = shapeLayer.getSource();
    switch(shapeType) {
        case 'rectangle': 
            draw = new ol.interaction.Draw({
                source: shapeSource,
                type: "Circle",
                geometryFunction: ol.interaction.Draw.createBox()
            });
            break;
        case 'circle':
            draw = new ol.interaction.Draw({
                source: shapeSource,
                type: "Circle",
                geometryFunction: ol.interaction.Draw.createRegularPolygon(200,0)
            });
            break;
        case 'ellipse':
            draw = new ol.interaction.Draw({
                source: shapeSource,
                type: 'Circle',
                geometryFunction: function(coordinates, geometry) {
                    if(!geometry) {
                        geometry = new ol.geom.Circle([coordinates[0][0], coordinates[0][1]], 0.0000001, 'XY');
                        geometry = ol.geom.Polygon.fromCircle((<ol.geom.Circle>geometry), 200);
                    }
                    var extent = geometry.getExtent();
                    var center = [0.5*(extent[0] + extent[2]), 0.5 * (extent[1] + extent[3])];   
                    var scaleX = 2*(center[0] - coordinates[1][0]) / (extent[0] - extent[2]);
                    var scaleY = 2*(center[1] - coordinates[1][1]) / (extent[1] - extent[3]);
                    if(scaleX == 0) scaleX = 1;
                    if(scaleY == 0) scaleY = 1;
                    var transX = (coordinates[0][0]+coordinates[1][0])/2 - center[0];
                    var transY = (coordinates[0][1]+coordinates[1][1])/2 - center[1];
                    geometry.translate(transX, transY);   
                    geometry.scale(scaleX, scaleY);
                    return geometry;
                }
            });
            break;                
        case 'freeform':
            draw = new ol.interaction.Draw({
                source: shapeSource,
                type: "Polygon",
                freehand: true
            });
            break;
        case 'polyline':
            draw = new ol.interaction.Draw({
                source: shapeSource,
                type: "LineString"
            });
            break;
        case 'polygon':
            draw = new ol.interaction.Draw({
                source: shapeSource,
                type: "Polygon",
                freehand: false
            });
            break;
        case 'delete':
            deleteInteraction.setActive(!deleteInteraction.getActive()); // toggle
            break;                                                
    }
    if(draw != undefined) {
        draw.on('drawend', function(e) {
            // avoid duplicate naming
            while(globals.shapes[shapeType + shapeCounts[shapeType]] != null) {
                shapeCounts[shapeType]++;
            }
            e.feature.setProperties({ 
                'id': shapeType + shapeCounts[shapeType]
            });
            var shape = new Shape(e.feature, shapeLayer, null);
            globals.shapes[shapeType + shapeCounts[shapeType]] = shape;
            shapeCounts[shapeType]++;

            draw.setActive(false);
            map.removeInteraction(draw);
            radioSelection = null;
            (<HTMLInputElement>document.querySelector('input[name = "draw-select"]:checked')).checked = false;
        });        
        map.addInteraction(draw);
    }
    addRemoveFeatures();
}

function setupDelete(){
    deleteInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        }
    });

    deleteInteraction.getFeatures().on('add', function (e){
        globals.shapes[e.element.get('id')].getLayer().getSource().removeFeature(e.element);
        deleteInteraction.getFeatures().remove(e.element);
        delete globals.shapes[e.element.get('id')];
        radioSelection = null;
        (<HTMLInputElement>document.querySelector('input[name = "draw-select"]:checked')).checked = false;
                deleteInteraction.setActive(false);  
        setupShapes();
    });
    deleteInteraction.setActive(false);
    map.addInteraction(deleteInteraction);
}

function addRemoveFeatures() {
    shapeLayer.getSource().on('addfeature', function(evt){
        setupShapes();
    });
}

export function drawSetup() {
    document.getElementById('drawButton').onclick = drawPopup;
    var app = document.getElementById("app");
    var drawDiv = windowSetup('draw', 'Draw');
    app.appendChild(drawDiv);
    drawDiv.classList.toggle('show');

    drawButtons();
    setupDelete();
}

function drawPopup() {
    var drawPopupText = document.getElementById('drawPopupText')
    if(drawPopupText.classList.toggle("show")) {
        // move around the popup
        $(drawPopupText.parentElement).draggable();
        $(drawPopupText).resizable({
            handles: 'all'
        });
        $(drawPopupText.parentElement).zIndex(1);
    } 
}

function drawButtons() {
    var innerText = [ 'rectangle', 'circle', 'freeform', 'polyline', 'polygon', 'ellipse', 'delete'];
    var elementID = ['drawRect', 'drawCirc', 'drawFreeform', 'drawPolyline', 'drawPolygon', 'drawEllipse', 'delete'];
    for(var i in innerText) {
        var div = document.createElement('div');
        div.id = elementID[i];

        var radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('value', innerText[i])
        radioInput.setAttribute('id', elementID[i]+'Option')
        radioInput.setAttribute('class', 'drawButtonOption');

        var label = document.createElement('label');
        label.setAttribute('for', elementID[i]+'Option');
        label.setAttribute('class', 'drawButtonOptionLabel');
        label.innerText = innerText[i];

        div.appendChild(radioInput);
        div.appendChild(label);
        document.getElementById('draw-contents').appendChild(div);
        radioInput.onclick = function(){
            if(radioSelection == (<HTMLInputElement>this).value) {
                (<HTMLInputElement>this).checked = false;
                radioSelection = null;
            } else {
                radioSelection = (<HTMLInputElement>this).value;
                drawShape(radioSelection);
            }
        };
        radioInput.name = 'draw-select';
    }


}