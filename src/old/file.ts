import {setupShapes} from './getm';
import {globals} from './globals';
import {Shape} from './Shape';
import {map} from './map';
import * as ol from 'openlayers';
declare const ProductRestInterface;
declare const CGSWeb_Map;
var SHAPES_LAYER = 2;

// clears map of shapes and retrieves stored shapes
function loadSession(){
    // clear this session first;
    for (var shapesID in globals.shapes){
        (globals.shapes[shapesID]).getLayer().getSource().removeFeature(globals.shapes[shapesID].getFeature());
        delete globals.shapes[shapesID];
    }
    // for each stored shape, place feature on specified layer
    if(localStorage.shapes){
        var storageShapes = JSON.parse(localStorage.shapes);
        for(var shapesID in storageShapes) {
            var feature = new ol.format.KML().readFeature(storageShapes[shapesID]['feature']);
            for(var layer of (<ol.layer.Group>map.getLayerGroup().getLayers().getArray()[SHAPES_LAYER]).getLayers().getArray()){         
                if( (<ol.layer.Vector>layer).get('name') == storageShapes[shapesID]['layer']){
                    (<ol.layer.Vector>layer).getSource().addFeature(feature);    
                    globals.shapes[shapesID] = new Shape(
                        feature,
                        layer,
                        storageShapes[shapesID]['properties'],
                        storageShapes[shapesID]['objectID']
                    );         
                    feature.setStyle(<ol.style.Style>(<ol.layer.Vector>layer).getStyle());
                    break;
                }
            }
        }
    }
    // reflect changes in getm tables
    setupShapes();
}

// saves all shapes on map to local storage
function saveSession(){
    var storageShapes = {};
    for(var shapesID in globals.shapes) {
        var storageShape = {};

        storageShape['feature'] = new ol.format.KML().writeFeatures([globals.shapes[shapesID].getFeature()]);
        storageShape['layer'] = globals.shapes[shapesID].getLayer().get('name');
        storageShape['properties'] = globals.shapes[shapesID].getProperties();
        storageShape['objectID'] = globals.shapes[shapesID].getObjectID();
        storageShapes[shapesID] = storageShape;
    }
    localStorage.shapes = JSON.stringify(storageShapes);
}

// saves shapes as a shapefile or kml
function saveShapes(){
    var featureArray = [];
    for(var shapesID in globals.shapes) {
        if(globals.shapes[shapesID].getLayer().getVisible()) {
            featureArray.push(globals.shapes[shapesID].getFeature());
        }
    }                
    var a = document.createElement('a');         

    var geoJsons = [];
    for(var feature of featureArray) {
        var geoJson = new ol.format.GeoJSON().writeFeature(feature);
        geoJson = JSON.parse(geoJson);
        geoJson['properties']['type'] = geoJson['geometry']['type'];
        geoJsons.push(JSON.stringify(geoJson));
    }

    $.ajax({
        type: 'POST',
        url: ProductRestInterface.getSaveShapesUrl(),
        data: JSON.stringify({'geoJsons': geoJsons, 'saveFormat': CGSWeb_Map.Options.saveFormat}),
        contentType: 'application/json',
        success: function(response, status, xhr) {successSave(response, a)},
     });       
}

function successSave(response, a) {
    if(response['result']) {
        a.href = ProductRestInterface.getResultUrl() + response['result'];
        a.download='';  
    }
    a.click();
}

// prints map
function printImg(e) {
    e.preventDefault();
    var canvas = document.getElementById("map").getElementsByClassName("ol-unselectable")[0];
    var img = (canvas as any).toDataURL('image/png');
    var popup = window.open();
    popup.document.write('<img src="'+img+'"/>');
    popup.focus(); //required for IE 
    $(popup).ready(function(){
        popup.window.print();
        popup.close();
    });
}

export function fileSetup() {
    // TODO: dynamically add to nav bar and do the clicky stuff
    $('#saveBtn').click(saveShapes);
    $('#saveSessBtn').click(saveSession);
    $('#loadSessBtn').click(loadSession);   
    $('#printBtn').click(printImg);
}