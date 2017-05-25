import {source, map} from './map';
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
export var features = {};

// TODO: do something about the draw functions? really repetitive code
function drawRectangle() {
    if(draw == undefined) {
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
    if(source.getFeatures() == null || source.getFeatures().length == 0) {
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
            source: source,
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
        // console.log('asdf');
        e.preventDefault();
        var feature = map.forEachFeatureAtPixel(map.getEventPixel(e),
            function (feature, layer) {
                return feature;
        });
        if (feature) {
            // document.getElementById('debug').innerHTML =
            //     'got feature '+ feature.get('id') + 
            //     ' at position (' + (<MouseEvent>e).screenX + ',' + (<MouseEvent>e).screenY + ')'; //TODO: popup location??? or just center?
            (<HTMLInputElement>document.getElementById('tgt_name')).value = feature.get('id');
            layerInfoPopup();

            document.getElementById('submitlayerinfo').onclick = function() {submitShapes( document.getElementById('layerinfoform')); /*buildJson();*/};
        }
    });
}


// TODO: organize this remove/add feature blurb
{
    source.on('removefeature', function(e){
        selectInteraction.setActive(true);
        deleteInteraction.setActive(false);
        setupShapes();
    });

    source.on('addfeature', function(evt){
        draw.setActive(false);
        draw = undefined;
        (<HTMLInputElement>document.getElementById('tgt_name')).value = source.getFeatures().pop().get('id');
        fillLayerInfoDefaults();
        // TODO: create new page of stuff
        // if(debug) {
        //     fillLayerInfoDefaults();
        //     // , {dataProjection: 'EPSG:900913',featureProjection: 'EPSG:4326'}
        //     var geojsonfeature = new ol.format.GeoJSON().writeFeature(source.getFeatures().pop());
        //     document.getElementById('debug').innerHTML = 'adding: ' + source.getFeatures().pop().get('id')
        //         + '<br/>num of objs: ' + Object.keys(features).length
        //         + '<br/>' + Object.keys(features).toString()
        //         + '<br/>' + source.getFeatures().pop().getGeometry().getExtent().toString()
        //         + '<br/>' + geojsonfeature;
        // }
        
        setupShapes();
    });
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
    var functions = [drawRectangle, drawCircle, drawFreeform, drawPolyline, drawPolygon, drawDelete];
    for(var i in innerText) {
        var button = document.createElement('button');
        button.innerText = innerText[i];
        document.getElementById(elementID[i]).appendChild(button);
        button.onclick = functions[i]; 
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
