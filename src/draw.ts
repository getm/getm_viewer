import {shapeSource, shapeSources, map, currShapeLayer} from './map';
import * as $ from 'jquery';
import * as ol from 'openlayers';
import './css/draw.css';
import {setupShapes} from './getm';
import {layerInfoPopup, layerInfoMap, fillLayerInfoDefaults} from './layerinfo';
import {debug} from './config'


// go over which i need
var draw;
var selectedFeatureID;
var id = 0;
var currShape;

export var features = {};
// let asdf = (window as any).asdf; 
// if(!asdf) {
//     (window as any).asdf = {};
//     asdf = (window as any).asdf;
// }
// asdf['a'] = 'A';
// console.log(asdf);

// TODO: do something about the draw functions? really repetitive code
function drawRectangle() {
    if(draw == undefined) {
        draw = new ol.interaction.Draw({
            source: shapeSource,
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
    addRemoveFeatures();
}

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
                    'id': shape+id
                });
                features[shape+id] = e.feature;
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

function drawCircle() {
    if(draw == undefined) {
        draw = new ol.interaction.Draw({
            source: shapeSource,
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
    addRemoveFeatures();
}

function drawFreeform() {
    if(draw == undefined) {
        draw = new ol.interaction.Draw({
            source: shapeSource,
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
        draw = new ol.interaction.Draw({
            source: shapeSource,
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
    if(shapeSource.getFeatures() == null || shapeSource.getFeatures().length == 0) {
        alert("no features");
        return;
    } else {
        selectInteraction.setActive(false);
        deleteInteraction.setActive(true);
    }
}

function drawPolygon() {
    if(draw == undefined) {
        draw = new ol.interaction.Draw({
            source: shapeSource,
            type: "Polygon",
            freehand: false
        });
        draw.on('drawend', function(e) {
            e.feature.setProperties({
                'id': 'polygon'+id
            });
            features['polygon'+id] = e.feature;
            id++;
        });
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
        draw = undefined;
    }
}

//TODO: clean up select interaction and delete interaction 
{
    var selectInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        },
        condition: ol.events.condition.click
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
        shapeSource.removeFeature(e.element);
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

// //TODO: callback function for update shapes
function submitShapes(form) {

    var s = 'form has ' + form.children.length + 'stuffs<br/>'
    for(var i = 0; i < form.children.length-1; i++) {
        s = s +'child ' + (i+1) + ' is ' + form.children[i].firstChild.id + ': ' + form.children[i].firstChild.value 
        + ' with type ' + form.children[i].firstChild.type +'<br/>'
    }
    document.getElementById('debug').innerHTML = s;
    
     //+ 'child has ' + form.firstChild.children.length + 'stuffs';
        // 'got feature '+ feature.get('id') + 
        // ' at position (' + (<MouseEvent>e).screenX + ',' + (<MouseEvent>e).screenY + ')';
}

// TODO: map right click thing to edit info
{
    map.getViewport().addEventListener('contextmenu', function (e) {
        e.preventDefault();
        var feature = map.forEachFeatureAtPixel(map.getEventPixel(e),
            function (feature, layer) {
                return feature;
        });
        if (feature) {
            // document.getElementById('debug').innerHTML =
            //     'got feature '+ feature.get('id') + 
            //     ' at position (' + (<MouseEvent>e).screenX + ',' + (<MouseEvent>e).screenY + ')'; //TODO: popup location??? or just center?
            selectedFeatureID = feature.get('id');
            (<HTMLInputElement>document.getElementById('tgt_name')).value = feature.get('id');
            (<HTMLInputElement>document.getElementById('layerinfolayer')).value = currShapeLayer;
            layerInfoPopup();
            document.getElementById('submitlayerinfo').onclick = function() {
                submitShapes( document.getElementById('layerinfoform')); 
            };
        }
    });
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
        fillLayerInfoDefaults();
        setupShapes();
    });
}

export function saveShapes() {
    var a = document.createElement('a');
    a.download = 'helloworld.kml';
    var saveButton = document.getElementById('saveBtn');
    saveButton.appendChild(a);
    saveButton.onclick = function(){
        alert('saving id ' + id);
        var kml = new ol.format.KML().writeFeatures(features[id]);
        a.href = window.URL.createObjectURL(new Blob([kml], {'type': 'application/octet-stream'}));
        a.click(); 
    };
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
    var innerText = [ 'rectangle', 'circle', 'freeform', 'polyline', 'polygon', 'delete'];
    var elementID = ['drawRect', 'drawCirc', 'drawFreeform', 'drawPolyline', 'drawPolygon', 'delete'];
    for(var i in innerText) {
        var button = document.createElement('button');
        button.innerText = innerText[i];
        document.getElementById(elementID[i]).appendChild(button);
        button.onclick = function(){drawShape(this.innerText);};
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
