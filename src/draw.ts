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
var radioSelection;

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

function windowSetup(id){
    var popup = document.createElement('div');
    popup.id = id+'Popup';
    popup.className = 'popup';
    document.getElementById('getmpage').appendChild(popup);

    var popupText = document.createElement('div');
    popupText.id = id+'PopupText';
    popupText.className = 'popuptext';
    popup.appendChild(popupText);

    var windowHeaders = document.createElement('div');
    windowHeaders.className = 'window-headers';
    popupText.appendChild(windowHeaders);

    var windowHeaderTitle = document.createElement('span');
    windowHeaderTitle.innerHTML = id;
    windowHeaders.appendChild(windowHeaderTitle);

    var windowHeadersCloseBtn = document.createElement('button');
    windowHeadersCloseBtn.className = "close";
    windowHeadersCloseBtn.innerHTML = "&times;";
    windowHeadersCloseBtn.onclick = function () {
        popupText.classList.toggle("show");
        $(popupText).zIndex(-1);
    };
    windowHeaders.appendChild(windowHeadersCloseBtn);

    var windowContents = document.createElement('div');
    windowContents.className = 'window-contents';
    windowContents.id = id + '-contents';
    popupText.appendChild(windowContents);

    document.getElementById('searchBtn').onclick = function(){
        if(popupText.classList.toggle("show")) {
            $(popup).zIndex(2);
        }
    };

    $(popup).draggable();
    $(popupText).resizable({
        handles: 'all'
    });
    return popup;
}

// TODO: do something about the draw functions? really repetitive code
function drawShape(shapeType) {
    if(map.getInteractions().getArray().indexOf(draw) != -1) {
        draw.setActive(false);
        map.removeInteraction(draw);
    }
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
        setupShapes();
    });
}

// TODO: something about organizing this
export function drawSetup() {
    // TODO: encapsilate window creation rather than do a read send
    document.getElementById('drawButton').onclick = drawPopup;
    var app = document.getElementById("app");
    var drawDiv = windowSetup('draw');

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
        var div = document.createElement('div');
        div.id = elementID[i];

        var radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('value', innerText[i])
        radioInput.setAttribute('id', elementID[i]+'Option')

        var label = document.createElement('label');
        label.setAttribute('for', elementID[i]+'Option');
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
        if(innerText[i] == 'ellipse') {
            radioInput.className = radioInput.className + ' inprogress';
        }
        radioInput.name = 'draw-select';
    }


}
