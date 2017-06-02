import {shapeSource, map, currShapeLayer} from './map';
import * as $ from 'jquery';
import * as ol from 'openlayers';
import './css/draw.css';
import {setupShapes} from './getm';
import {fillLayerInfoDefaults} from './layerinfo';
import {layerInfoMap, features, debug} from './globals';



// go over which i need
var draw;
var selectedFeatureID;
var id = 0;
var currShape;
var deleteInteraction, selectInteraction;

// TODO: do something about the draw functions? really repetitive code
function drawShape(shape) {
    if(draw == undefined) {
        console.log('draw is undefined and shape is ' + shape);
        switch(shape) {
            case 'rectangle': 
                draw = new ol.interaction.Draw({
                    source: shapeSource,
                    type: "Circle",
                    geometryFunction: ol.interaction.Draw.createBox(),
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
                // toggle
                selectInteraction.setActive(!selectInteraction.getActive());
                deleteInteraction.setActive(!deleteInteraction.getActive());
                break;                                                
        }
        if(draw != undefined) {
            draw.on('drawend', function(e) {
                e.feature.setProperties({
                    'id': shape+id,
                    'shapelayer': currShapeLayer
                });
                features[shape+id] = e.feature;
                console.log('setting shpae layer to be ' + currShapeLayer);
                //features[shape+id]['shapelayer'] = currShapeLayer; // TODO: this isn't updating correctly.... see shapeSource?
                id++;
            });        
            map.addInteraction(draw);
        }
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
    addRemoveFeatures();
}

//TODO: clean up select interaction and delete interaction 
function setupSelect() {
    selectInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        },
        condition: ol.events.condition.click
    });
    map.addInteraction(selectInteraction);
}

function setupDelete(){
    deleteInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        }
    });

    deleteInteraction.getFeatures().on('add', function (e){
        selectedFeatureID = e.element.get('id');
        // remove all
        delete features[selectedFeatureID];
        shapeSource.removeFeature(e.element);

        // debugging statements
        document.getElementById('debug').innerHTML = "deleting: " + selectedFeatureID 
            + '<br/>num of objs: ' + Object.keys(features).length
            + '<br/>' + Object.keys(features).toString();
    });
    deleteInteraction.setActive(false);
    map.addInteraction(deleteInteraction);
}
// //TODO: callback function for update shapes
function submitShapes(form) {

}

// TODO: organize this remove/add feature blurb
function addRemoveFeatures() {
    shapeSource.on('removefeature', function(e){
        selectInteraction.setActive(true);
        deleteInteraction.setActive(false);
        setupShapes();
    });

    shapeSource.on('addfeature', function(evt){
        if(draw != undefined) {
            draw.setActive(false);
            draw = undefined;
        }
        (<HTMLInputElement>document.getElementById('tgt_name')).value = shapeSource.getFeatures().pop().get('id');
        fillLayerInfoDefaults(); // TODO
        setupShapes();
    });
}

export function saveShapes() {
    console.log('saving');
    // var a = document.createElement('a');
    // a.download = 'helloworld.kml';
    // var saveButton = document.getElementById('saveBtn');
    // saveButton.appendChild(a);
    // saveButton.onclick = function(){
    //     alert('saving id ' + id);
    //     var kml = new ol.format.KML().writeFeatures(features[id]);
    //     a.href = window.URL.createObjectURL(new Blob([kml], {'type': 'application/octet-stream'}));
    //     a.click(); 
    // };
}

// TODO: something about organizing this
export function drawSetup() {
    var btn = document.createElement('button');
    btn.innerText = 'draw';
    document.getElementById('drawButton').appendChild(btn);
    btn.onclick = drawPopup;

    var app = document.getElementById("app");
    var drawDiv = document.createElement('div');
    var read = new XMLHttpRequest();
    read.open('GET', 'draw.html', false);
    read.send();
    drawDiv.innerHTML = read.responseText;
    app.appendChild(drawDiv);
    drawDiv.classList.toggle('show');

    drawButtons();
    setupSelect();
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

// TODO: disable all butttons except current selected one
function disableButtons() {
}

// draw buttons
function drawButtons() {
    var innerText = [ 'rectangle', 'circle', 'freeform', 'polyline', 'polygon', 'ellipse', 'delete'];
    var elementID = ['drawRect', 'drawCirc', 'drawFreeform', 'drawPolyline', 'drawPolygon', 'drawEllipse', 'delete'];
    for(var i in innerText) {
        var button = document.createElement('button');
        button.innerText = innerText[i];
        document.getElementById(elementID[i]).appendChild(button);
        button.onclick = function(){drawShape(this.innerText);};
        if(innerText[i] == 'ellipse')
        {
            button.className = button.className + ' inprogress';
        }
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
