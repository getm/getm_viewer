import * as $ from 'jquery';
import 'jqueryui';
import './css/getm.css';
import * as ol from 'openlayers';
import {layerInfoPopup} from './layerinfo'; // to something about this?
import {globals, windowSetup} from './globals';
import {map} from './map';
import {Shape} from './Shape';
const WILDCARD = '*';
declare const CGSWeb_Map;
declare const GeoServerRestInterface;

function loadSession(){
    // clear this session first;
    for (var shapesID in globals.shapes){
        (globals.shapes[shapesID]).getLayer().getSource().removeFeature(globals.shapes[shapesID].getFeature());
        delete globals.shapes[shapesID];
    }

    if(localStorage.shapes){
        var storageShapes = JSON.parse(localStorage.shapes);
        for(var shapesID in storageShapes) {
            var feature = new ol.format.KML().readFeature(storageShapes[shapesID]['feature']);
            for(var layer of (<ol.layer.Group>map.getLayerGroup().getLayers().getArray()[3]).getLayers().getArray()){         
                if( (<ol.layer.Vector>layer).get('name') == storageShapes[shapesID]['layer']){
                    (<ol.layer.Vector>layer).getSource().addFeature(feature);    
                    globals.shapes[shapesID] = new Shape(
                        feature,
                        layer,
                        storageShapes[shapesID]['properties'],
                        storageShapes[shapesID]['objectID']
                    );                      
                    break;
                }
            }
   
        }
    }
    setupShapes();
}

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

function saveShapes(){
    var featureArray = [];
    for(var shapesID in globals.shapes) {
        if(globals.shapes[shapesID].getLayer().getVisible()) {
            featureArray.push(globals.shapes[shapesID].getFeature());
        }
    }                
    var a = document.createElement('a');
    a.download = 'shapes.shp';            
    var shp = new ol.format.GeoJSON().writeFeatures(featureArray);
    a.href = window.URL.createObjectURL(new Blob([shp], {'type': 'application/octet-stream'}));
    a.click();         
}

function besearch(){
    var results = [];
    document.getElementById('besearchResults').innerHTML = "";
    for (var shapesID in globals.shapes) {   
        if($('#besearch').val()) {
            if($('#besearch').val() == WILDCARD ||
            (globals.shapes[shapesID].getProperty('benumber') == $('#besearch').val())) {
                var result = document.createElement('div');
                result.innerHTML = shapesID;
                result.onclick = function(){
                    globals.selectedFeatureID = this.innerHTML;
                    layerInfoPopup();
                }
                document.getElementById('besearchResults').appendChild(result);
            }
        }
    }
}

function normalizeExtent(extent) {
    // Check if total Lon > 360.
    if(extent[0] > 0 && extent[2] > 0 && extent[2] - extent[0] > 360) {
        // Entire extent east of 0.
        extent[0] = -180;
        extent[2] = 180;
    } else if(extent[0] < 0 && extent[2] < 0 && Math.abs(extent[0]) - Math.abs(extent[2]) > 360) {
        // Entire extent west of 0.
        extent[0] = -180;
        extent[2] = 180;
    } else if(extent[0] < 0 && extent[2] > 0 && Math.abs(extent[0]) + Math.abs(extent[2]) > 360) {
        // Extent contains 0.
        extent[0] = -180;
        extent[2] = 180;
    }

    // Check if total Lat > 180.
    if(extent[1] > 0 && extent[3] > 0 && extent[3] - extent[1] > 180) {
        // Entire extent north of 0.
        extent[1] = -90;
        extent[3] = 90;
    } else if(extent[1] < 0 && extent[3] < 0 && Math.abs(extent[1]) - Math.abs(extent[3]) > 180) {
        // Entire extent south of 0.
        extent[1] = -90;
        extent[3] = 90;
    } else if(extent[1] < 0 && extent[3] > 0 && Math.abs(extent[1]) + Math.abs(extent[3]) > 180) {
        // Extent contains 0.
        extent[1] = -90;
        extent[3] = 90;
    }

    // Shift lon to range (-360, 360).
    var max = Math.max(Math.abs(extent[0]), Math.abs(extent[2]));
    var revs = Math.floor(max / 360);
    if(extent[0] > 0 && extent[2] > 0) {
        extent[0] = extent[0] - revs*360;
        extent[2] = extent[2] - revs*360;
    } else if(extent[0] < 0 && extent[2] < 0) {
        extent[0] = extent[0] + revs*360;
        extent[2] = extent[2] + revs*360;
    }

    if(extent[2] > 180) {
        // Wrap to the east.
        return [
            [extent[1], extent[0], extent[3], 180],
            [extent[1], -180, extent[3], -180 + (extent[2] - 180)],
        ];
    } else if(extent[0] < -180) {
        // Wrap to the west.
        return [
            [extent[1], -180,extent[3], extent[2]],
            [extent[1], 180 + (extent[0] + 180), extent[3], 180],
        ];
    } else {
        return [extent[1], extent[0], extent[3], extent[2]];
    }
}

// catcode searches within range
function catsearch() {
    var extent = map.getView().calculateExtent(map.getSize());
    document.getElementById('catsearchResults').innerHTML = "";
    (<ol.layer.Group>(map.getLayerGroup().getLayers().getArray()[3])).getLayers().getArray().forEach(function(layer){
        (<ol.layer.Vector>layer).getSource().getFeaturesInExtent(extent).forEach(function(feature){
            if($('#catsearch').val()){
                if($('#catsearch').val() == WILDCARD ||
                    (globals.shapes[feature.getProperties()['id']].getProperty('catcode') == $('#catsearch').val())) {
                    var result = document.createElement('div');
                    result.innerHTML = feature.getProperties()['id'];
                    result.onclick = function(){
                        globals.selectedFeatureID = this.innerHTML;
                        layerInfoPopup();
                    }
                    document.getElementById('catsearchResults').appendChild(result);
                }
            }            
        })
    });
}

export function setup() {
    catsearchFiltersSetup();
    besearchFiltersSetup();
    getmSetup();
    mapLayerSetup();

    // TODO: dynamically add to nav bar and do the clicky stuff
    $('#saveBtn').click(saveShapes);
    $('#saveSessBtn').click(saveSession);
    $('#loadSessBtn').click(loadSession);   
    $('#printBtn').click(printImg);
}

function printImg(e) {

    var oldIdx = $('#map').zIndex();
    var oldHeight = $('#map').height();

    $('#map').height('max-content');
    $('#map').zIndex(9999);
    $('#map').addClass('whitebg');
    document.getElementById('map').focus();

    // var popupCollection = document.getElementsByClassName('popup');
    // var modifiedPopups = [];
    // for( var popup in popupCollection) {       
    //     if(popupCollection[popup] != undefined && popupCollection[popup].classList != undefined)
    //         if(popupCollection[popup].classList.contains('show')){
    //             modifiedPopups.push([$('#' + popupCollection[popup].id + 'Text'), $(popupCollection[popup])]);
    //             $('#' + popupCollection[popup].id + 'Text').removeClass('show');
    //             $(popupCollection[popup]).zIndex(-1);  
    //         }
    //         //popupCollection[popup].classList.add('hide');
    // }
    window.print();

    $('#map').zIndex(oldIdx);
    $('#map').height(oldHeight);
    $('#map').removeClass('whitebg');

    // modifiedPopups.forEach(function(pair){
    //     var popupText = pair[0];
    //     var popup = pair[1];
    //     popupText.addClass('show');
    //     popup.zIndex(2);
    // })
    // for( var popup in popupCollection) {       
    //     if(popupCollection[popup] != undefined && popupCollection[popup].classList!= undefined) 
    //         popupCollection[popup].classList.remove('hide');
    // }
}

function catsearchFiltersSetup() {
    var catsearchFilterPopup = windowSetup('catsearchFilter', 'Cat Search');
    document.getElementById('app').appendChild(catsearchFilterPopup);

    var catsearchResults = document.createElement('div');
    catsearchResults.id = 'catsearchResults';
    document.getElementById('catsearchFilter-contents').appendChild(catsearchResults);
    document.getElementById('catsearchBtn').onclick = function() {
        $('#catsearchFilterPopupText').addClass('show');
        $('#catsearchFilterPopup').zIndex(2);     
        catsearch();    
    }
}

function besearchFiltersSetup() {
    var besearchFilterPopup = windowSetup('besearchFilter', 'BE Search');
    document.getElementById('app').appendChild(besearchFilterPopup);

    var besearchResults = document.createElement('div');
    besearchResults.id = 'besearchResults';
    document.getElementById('besearchFilter-contents').appendChild(besearchResults);
    document.getElementById('besearchBtn').onclick = function(){
        $('#besearchFilterPopupText').addClass('show');
        $('#besearchFilterPopup').zIndex(2);     
        besearch();      
    }
}

function getmSetup() {
    var getm = windowSetup('getm');
    document.getElementById('getmButton').onclick = function(){    
        if(document.getElementById("getmPopupText").classList.toggle("show")) {
            $("#getmPopup").zIndex(2);
        };
    }
    var div1 = document.createElement('div');
    div1.id = 'layer';
    div1.align = 'center';
    document.getElementById('getm-contents').appendChild(div1);

    var span = document.createElement('span'); 
    span.innerHTML = 'Layer:';
    div1.appendChild(span);
    
    var span2 = document.createElement('span');
    div1.appendChild(span2);

    var shapeLayerSelect = document.createElement('select');
    shapeLayerSelect.id = 'getm-shape-layer-select';
    shapeLayerSelect.className = 'shape-layer-select';
    span2.appendChild(shapeLayerSelect);

    var div2 = document.createElement('div');
    div2.id = 'shapes';
    document.getElementById('getm-contents').appendChild(div2);
    setupShapes();

}

function mapLayerSetup() {
    var mapLayer = windowSetup('mapLayer', 'Map Layers');
    document.getElementById('mapLayerButton').onclick = function(){
        if(document.getElementById("mapLayerPopupText").classList.toggle("show")) {
            $("#mapLayerPopup").zIndex(2);
        }
    };

    document.getElementById('app').appendChild(mapLayer);
    var div1 = document.createElement('div');
    div1.align = 'center';
    document.getElementById('mapLayer-contents').appendChild(div1);

    var div2 = document.createElement('div'); 
    div2.id = 'wmslayer';
    div1.appendChild(div2);

    var span1 = document.createElement('span');
    span1.innerHTML = 'WMS Layer: ';
    div2.appendChild(span1);

    var select1 = document.createElement('select');
    select1.className = 'basemap-layer-select';
    div2.appendChild(select1);

    var div3 = document.createElement('div'); 
    div3.id = 'shapeLayer';
    div1.appendChild(div3);

    var span2 = document.createElement('span');
    span2.innerHTML = 'Shape Layer: ';
    div3.appendChild(span2);

    var select2 = document.createElement('select');
    select2.className = 'shape-layer-select';
    div3.appendChild(select2);
}

// setup shapes 
export function setupShapes() {
    var insertEntries = [];
    var updateEntries = [];
    var deleteEntries = [];
    for(var shapesID in globals.shapes) {
        if(globals.shapes[shapesID].getLayer().getVisible()) {
            if(globals.shapes[shapesID].objectID == -1)
                insertEntries.push(shapesID);
            else {
                updateEntries.push(shapesID); // TODO: indicate update stuff
                deleteEntries.push(shapesID);
            }
        }
    }

    var shapeEntries = [insertEntries, updateEntries, deleteEntries];
    var shapeActions = ['insertShapes', 'updateShapes', 'deleteShapes']; 
    var shapesContent = document.getElementById('shapes');
    var buttonActions = [insertShapes, updateShapes, deleteShapes];

    shapesContent.innerHTML="";
    for(var a in shapeActions) {
        var div0 = document.createElement('div');
        div0.id = shapeActions[a];
        shapesContent.appendChild(div0);

        var label = document.createElement('label');
        label.innerText = shapeActions[a].charAt(0).toUpperCase() + shapeActions[a].replace('Shapes', ' Shapes').slice(1);
        div0.appendChild(label);

        var form = document.createElement('form');
        div0.appendChild(form);

        var div1 = document.createElement('div');
        form.appendChild(div1);

        var select = document.createElement('select');
        select.multiple = true;
        select.id = shapeActions[a] + 'Select';
        select.size = 10;
        div1.appendChild(select);

        for (var x of shapeEntries[a]) {
            var opt = document.createElement('option');
            opt.innerHTML = x;
            opt.ondblclick = function(){
                globals.selectedFeatureID = this.innerHTML;
                layerInfoPopup();
            };
            select.appendChild(opt);
        }

        var div2 = document.createElement('div');
        form.appendChild(div2);

        var input = document.createElement('button');
        input.type='button';
        input.innerText = shapeActions[a].charAt(0).toUpperCase() + shapeActions[a].replace('Shapes', '').slice(1);
        $(input).css('color', 'black');
        input.onclick = buttonActions[a];
        div2.appendChild(input);
    }
}

function normalizeCoord(coord) {
    // Lon is the only one that wraps.
    var revs = Math.floor(Math.abs(coord[0]) / 360);

    // Shift lon to range (-360, 360).
    if(coord[0] > 0) {
        coord[0] = coord[0] - revs*360;
    } else {
        coord[0] = coord[0] + revs*360;
    }

    if(coord[0] > 180) {
        coord[0] = -180 + (coord[0] - 180);
    } else if(coord[0] < -180) {
        coord[0] = 180 + (coord[0] + 180);
    }

    return coord;
}

// callback function for database stuffs
function updateShapesCallback(response, status, xhr) {
    if(response!= []) {
        for(var i in response){
            globals.shapes[response[i]['id']].setObjectID(response[i]['objectID']);
            setupShapes();
        }
    }
}

function buildInsert() {
    var records = [];
    var insertSelect = document.getElementById('insertShapesSelect');
    var selectedOptions = (<HTMLSelectElement>insertSelect).selectedOptions;

    for(var option = 0; option < selectedOptions.length; option++) {
        var layer = (globals.shapes[selectedOptions[option].text]).getLayer().get('name').toString();
        var geojson = new ol.format.GeoJSON().writeFeatureObject(globals.shapes[selectedOptions[option].text].getFeature());
        for(var coordinate in geojson['geometry']['coordinates']) {
            for(var coord in geojson['geometry']['coordinates'][coordinate]) {
                if(typeof geojson['geometry']['coordinates'][coordinate][coord] != 'number')
                    geojson['geometry']['coordinates'][coordinate][coord] = normalizeCoord(geojson['geometry']['coordinates'][coordinate][coord]);
            }
        }
        var entry = {};
        entry['id'] = selectedOptions[option].text;
        entry['objectID'] = globals.shapes[selectedOptions[option].text].getObjectID();
        entry['geoJson'] = geojson;
        entry[layer] = {'properties': globals.shapes[selectedOptions[option].text].getProperties()};
        records.push(JSON.stringify(entry));
    }
    return {'records':records};
}

function buildUpdate() {
    var records = [];
    var updateSelect = document.getElementById('updateShapesSelect');
    var selectedOptions = (<HTMLSelectElement>updateSelect).selectedOptions;

    for(var option = 0; option < selectedOptions.length; option++) {
        var layer = (globals.shapes[selectedOptions[option].text]).getLayer().get('name').toString();
        var geojson = new ol.format.GeoJSON().writeFeatureObject(globals.shapes[selectedOptions[option].text].getFeature());
        for(var coordinate in geojson['geometry']['coordinates']) {
            for(var coord in geojson['geometry']['coordinates'][coordinate]) {
                if(typeof geojson['geometry']['coordinates'][coordinate][coord] != 'number')
                    geojson['geometry']['coordinates'][coordinate][coord] = normalizeCoord(geojson['geometry']['coordinates'][coordinate][coord]);
            }
        }
        var entry = {};
        entry['id'] = selectedOptions[option].text;
        entry['objectID'] = globals.shapes[selectedOptions[option].text].getObjectID();
        entry['geoJson'] = geojson;
        entry[layer] = {'properties': globals.shapes[selectedOptions[option].text].getProperties()};
        records.push(JSON.stringify(entry));
    }
    return {'records':records};
}

function buildDelete() {
    var records = [];
    var deleteSelect = document.getElementById('deleteShapesSelect');
    var selectedOptions = (<HTMLSelectElement>deleteSelect).selectedOptions;

    for(var option = 0; option < selectedOptions.length; option++) {
        var entry= {};
        entry['id'] = selectedOptions[option].text;
        entry['objectID'] = (globals.shapes[selectedOptions[option].text]).getObjectID();
        entry['name'] = (globals.shapes[selectedOptions[option].text]).getLayer().get('name');
        records.push(JSON.stringify(entry));
    }
    return {'records':records};
}

function deleteShapes() {
     $.ajax({
         type: 'POST',
         url: GeoServerRestInterface.getPostDeleteUrl(),
         data: JSON.stringify(buildDelete()),
         contentType: 'application/json',
         success: updateShapesCallback,
     });
}

function updateShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertAndUpdateUrl(),
        data: JSON.stringify(buildUpdate()),
        contentType: 'application/json',
        success: updateShapesCallback,
    });
}

function insertShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertAndUpdateUrl(),
        data: JSON.stringify(buildInsert()),
        contentType: 'application/json',
         success: updateShapesCallback,
     });
}