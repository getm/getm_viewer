import {shapeLayer, map} from './map';
import * as $ from 'jquery';
import * as ol from 'openlayers';
import './css/draw.css';
import {setupShapes} from './getm';
import {fillLayerInfoDefaults} from './layerinfo';
import {globals} from './globals';
import {Shape} from './Shape';

// go over which i need
var draw;
var deleteInteraction;//, selectInteraction;
var shapeType;

var style = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: [0, 0, 255, 0.5],
        width: 2
    }),
    fill: new ol.style.Fill({
        color: 'transparent'
    })
});
var shapeCounts = {
    'rectangle': 0,
    'circle': 0,
    'ellipse': 0,
    'freeform': 0,
    'polyline': 0,
    'polygon': 0
}

// TODO: do something about the draw functions? really repetitive code
function drawShape(shapeType) {
    if(draw == undefined || shapeType == 'delete') {
        var shapeSource = shapeLayer.getSource();
        console.log('draw is undefined and shape is ' + shapeType);
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
                    type: "Circle"
                });
                break;
            case 'ellipse':
                draw = new ol.interaction.Draw({
                    source: shapeSource,
                    type: 'Circle',
                    geometryFunction: function(coordinates, geometry) {
                        if (!geometry) {
                            console.log('geom');
                            geometry =new ol.geom.Circle(null);
                        }
                        console.warn('coordinates reads');
                        console.log(coordinates[0]);
                        var a = (coordinates[0][0] - coordinates[1][0]);
                        a = (a < 0) ? (a * -1): a;
                        console.log('radius reads ' + a);

                        (<ol.geom.Circle>geometry).setCenterAndRadius([(coordinates[0][0] + coordinates[1][0])/2, (coordinates[0][1] + coordinates[1][1])/2], 
                            a/2, 
                            'XY');
                        ol.geom.Polygon.fromCircle(<ol.geom.Circle>geometry, 0, 0).applyTransform(function(g1, g2, dim){
                            return g2;
                        });
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
                draw = undefined;
                deleteInteraction.setActive(!deleteInteraction.getActive()); // toggle
                break;                                                
        }
        if(draw != undefined) {
            draw.on('drawend', function(e) {
                console.log('done drawing: ' + shapeType + shapeCounts[shapeType]);
                e.feature.setProperties({ 
                    'id': shapeType + shapeCounts[shapeType]
                });
                var shape = new Shape(e.feature, shapeLayer, null);
                globals.shapes[shapeType + shapeCounts[shapeType]] = shape;
                shapeCounts[shapeType]++;
            });        
            map.addInteraction(draw);
        }
    } else {
        map.removeInteraction(draw);
        draw = undefined;
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
        globals.selectedFeatureID = e.element.get('id');
        globals.shapes[globals.selectedFeatureID].getLayer().getSource().removeFeature(e.element);
        deleteInteraction.getFeatures().remove(e.element);
        delete globals.shapes[globals.selectedFeatureID];
        globals.selectedFeatureID = undefined;  
        (<HTMLInputElement>document.querySelector('input[name = "draw-select"]:checked')).checked = false;
        setupShapes();

    });
    deleteInteraction.setActive(false);
    map.addInteraction(deleteInteraction);
}

function addRemoveFeatures() {
    shapeLayer.getSource().on('removefeature', function(evt){
        deleteInteraction.setActive(false);     
    });

    shapeLayer.getSource().on('addfeature', function(evt){
        if(draw != undefined) {
            draw.setActive(false);
            draw = undefined;
            (<HTMLInputElement>document.querySelector('input[name = "draw-select"]:checked')).checked = false;
        }
        //globals.selectedFeatureID = shapeLayer.getSource().getFeatures().pop().get('id');
        setupShapes();
    });
}

// TODO: something about organizing this
export function drawSetup() {
    document.getElementById('drawButton').onclick = drawPopup;
    var app = document.getElementById("app");
    var drawDiv = document.createElement('div');
    var read = new XMLHttpRequest();
    read.open('GET', 'draw.html', false);
    read.send();
    drawDiv.innerHTML = read.responseText;
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

// draw buttons
function drawButtons() {
    var innerText = [ 'rectangle', 'circle', 'freeform', 'polyline', 'polygon', 'ellipse', 'delete'];
    var elementID = ['drawRect', 'drawCirc', 'drawFreeform', 'drawPolyline', 'drawPolygon', 'drawEllipse', 'delete'];
    for(var i in innerText) {
        var radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('value', innerText[i])
        radioInput.setAttribute('id', elementID[i]+'Option')
        //button.innerText = innerText[i];

        var label = document.createElement('label');
        label.setAttribute('for', elementID[i]+'Option');
        label.innerText = innerText[i];

        document.getElementById(elementID[i]).appendChild(radioInput);
        document.getElementById(elementID[i]).appendChild(label);

        radioInput.onclick = function(){
            if(shapeType == (<HTMLInputElement>this).value) {
                (<HTMLInputElement>this).checked = false;
                shapeType = null;
            } else {
                shapeType = (<HTMLInputElement>this).value;
                drawShape(shapeType);
            }
        };
        if(innerText[i] == 'ellipse') {
            radioInput.className = radioInput.className + ' inprogress';
        }

        radioInput.name = 'draw-select';
    }

    var drawCloseBtn = document.createElement('button');
    drawCloseBtn.className = "close";
    drawCloseBtn.innerHTML = "&times;";
    document.getElementById("draw-close").appendChild(drawCloseBtn);
    drawCloseBtn.onclick = function () {
        var drawPopupText = document.getElementById("drawPopupText");
            drawPopupText.classList.toggle("show");
            $(drawPopupText.parentElement).zIndex(-1);
    };
}
