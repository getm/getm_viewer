import * as $ from 'jquery';
import 'jqueryui';
import './css/getm.css';
import * as ol from 'openlayers';
import {GeoServerRestInterface} from './gsRestService';
import {layerInfoPopup} from './layerinfo'; // to something about this?
import {globals, windowSetup} from './globals';
import {map} from './map';
import {Shape} from './Shape';

const WILDCARD = '*';

function loadSession(){
    // clear this session first;
    for (var shapesID in globals.shapes){
        (globals.shapes[shapesID]).getLayer().getSource().removeFeature(globals.shapes[shapesID].getFeature());
        delete globals.shapes[shapesID];
    }

    if(localStorage.shapes){
        var storageShapes = JSON.parse(localStorage.shapes);
        for(var shapesID in storageShapes) {
            var layer = null;
            console.log('loading: ' + shapesID);
            var feature = new ol.format.KML().readFeature(storageShapes[shapesID]['feature']);
            for(var l of map.getLayerGroup().getLayers().getArray()){
                if( (<ol.layer.Vector>l).get('name') == storageShapes[shapesID]['layer']){
                    (<ol.layer.Vector>l).getSource().addFeature(feature);     
                    layer = l;
                }
            }

            globals.shapes[shapesID] = new Shape(
                feature,
                layer,
                storageShapes[shapesID]['properties'],
                storageShapes[shapesID]['objectID']
            );     
        }
    }
    setupShapes();
}

function saveSession(){
    var storageShapes = {};
    for(var shapesID in globals.shapes) {
        console.log('saving: ' + shapesID);
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

function search() {
    var results = [];
    for (var shapesID in globals.shapes) {
        var foundShape = undefined;
        if($('#catsearch').val()){
            if($('#catsearch').val() == WILDCARD ||
                (globals.shapes[shapesID].getProperty('catcode') == $('#catsearch').val())) {
                    console.log('found: ' + shapesID);
                    //results.push(shapesID);
                    foundShape = shapesID;
            }
        }
        if($('#besearch').val()) {
            if($('#besearch').val() == WILDCARD ||
            (globals.shapes[shapesID].getProperty('benumber') == $('#besearch').val())) {
                console.log('found: ' + shapesID);
                if(foundShape == shapesID)
                    results.push(shapesID);
            }
        }
    }

    document.getElementById('searchResults').innerHTML = JSON.stringify(results);
}

export function setup() {
    // getmFiltersSetup();
    searchFiltersSetup();
    getmSetup();
    mapLayerSetup();
    debugSetup();

    $('#saveBtn').click(saveShapes);
    $('#saveSessBtn').click(saveSession);
    $('#loadSessBtn').click(loadSession);   
    $('#printBtn').click(printImg);
}

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

function searchFiltersSetup() {
    var searchFilterPopup = windowSetup('searchFilter');
    document.getElementById('app').appendChild(searchFilterPopup);

    var windowContents = document.getElementById('searchFilter-contents');
    var beSearchfilter = document.createElement('div');
    windowContents.appendChild(beSearchfilter);

    var beSearchLabel = document.createElement('span'); 
    beSearchLabel.innerHTML = 'BE Search: ';
    beSearchfilter.appendChild(beSearchLabel);

    var beSearchInput = document.createElement('input');
    beSearchInput.type = 'search';
    beSearchInput.id = 'besearch';
    beSearchfilter.appendChild(beSearchInput);

    var catSearchfilter = document.createElement('div');
    windowContents.appendChild(catSearchfilter);

    var catSearchLabel = document.createElement('span'); 
    catSearchLabel.innerHTML = 'Catcode Search: ';
    catSearchfilter.appendChild(catSearchLabel);

    var catSearchInput = document.createElement('input');
    catSearchInput.type = 'search';
    catSearchInput.id = 'catsearch';
    catSearchfilter.appendChild(catSearchInput);

    var searchfilter = document.createElement('div');
    windowContents.appendChild(searchfilter);

    var filterSearchBtn = document.createElement('input');
    filterSearchBtn.type = 'button';
    filterSearchBtn.value = 'Search';
    filterSearchBtn.id = 'filterSearchBtn';
    filterSearchBtn.onclick = search;
    searchfilter.appendChild(filterSearchBtn);

    var searchResults = document.createElement('div');
    searchResults.className = 'window-contents';
    searchResults.id = 'searchResults';
    document.getElementById('searchFilterPopupText').appendChild(searchResults);
    document.getElementById('searchBtn').onclick = searchFiltersPopup;
}

function getmSetup() {
    var getm = windowSetup('getm');
    document.getElementById('getmButton').onclick = getmPopup;

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
    var getm = windowSetup('mapLayer');
    document.getElementById('mapLayerButton').onclick = mapLayerPopup;

    var div1 = document.createElement('div');
    div1.align = 'center';
    document.getElementById('mapLayer-contents').appendChild(div1);

    var div2 = document.createElement('div'); 
    div2.id = 'wmslayer';
    div1.appendChild(div2);

    var span1 = document.createElement('span');
    span1.innerHTML = 'WMS Layer: ';
    div2.appendChild(span1);

    var span2 = document.createElement('span');
    span2.className = 'layer-select';
    div2.appendChild(span2);

    var div3 = document.createElement('div'); 
    div3.id = 'shapeLayer';
    div1.appendChild(div3);

    var span3 = document.createElement('span');
    span3.innerHTML = 'Shape Layer: ';
    div3.appendChild(span3);

    var span4 = document.createElement('select');
    span4.className = 'shape-layer-select';
    div3.appendChild(span4);
}

function debugSetup() {
    var debug = windowSetup('debug');
    document.getElementById('debugButton').onclick = debugPopup; 
    document.getElementById('debug-contents').innerHTML = 'DEBUG TEXTS GO HERE';
}

// setup shapes 
export function setupShapes() {
    console.log('setupShapes');
    var insertEntries = [];
    var updateEntries = [];
    var deleteEntries = [];
    for(var shapesID in globals.shapes) {
        console.log('working on feature ' + shapesID + 
            ' with layer ' + globals.shapes[shapesID].getProperties() + 
            ' and shape layer ' + globals.shapes[shapesID].getLayer().get('name'));
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
                (<HTMLInputElement>document.getElementById('tgt_name')).value = this.innerHTML;
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
};

// callback function for database stuffs
function updateShapesCallback(response, status, asdf) {
    if(response!= []) {
        for(var i in response){
            if(globals.debug)
                console.log('old object id is ' + globals.shapes[response[i]['id']].getObjectID() );
            globals.shapes[response[i]['id']].setObjectID(response[i]['objectID']);
            if(globals.debug)
                console.log('new object id is ' +  response[i]['objectID']);
            setupShapes();
        }
    }
}

function buildInsert() {
    var records = [];
    var insertSelect = document.getElementById('insertShapesSelect');
    var selectedOptions = (<HTMLSelectElement>insertSelect).selectedOptions;

    console.log('selected insert options has this many elements ' + selectedOptions.length);

    for(var option = 0; option < selectedOptions.length; option++) {
        var layer = (globals.shapes[selectedOptions[option].text]).getLayer().get('name').toString();
        var geojson = new ol.format.GeoJSON().writeFeatureObject(globals.shapes[selectedOptions[option].text].getFeature());
        for(var coordinate in geojson['geometry']['coordinates']) {
            for(var coord in geojson['geometry']['coordinates'][coordinate]) {
                console.log(geojson['geometry']['coordinates'][coordinate][coord]);
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

    console.log('selected update options has this many elements ' + selectedOptions.length);
    for(var option = 0; option < selectedOptions.length; option++) {
        var layer = (globals.shapes[selectedOptions[option].text]).getLayer().get('name').toString();
        var geojson = new ol.format.GeoJSON().writeFeatureObject(globals.shapes[selectedOptions[option].text].getFeature());
        for(var coordinate in geojson['geometry']['coordinates']) {
            for(var coord in geojson['geometry']['coordinates'][coordinate]) {
                console.log(geojson['geometry']['coordinates'][coordinate][coord]);
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

    console.log('selected delete options has this many elements ' + selectedOptions.length);
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
         error: function(response, status, asdf){if(globals.debug) console.log("delete errors: " + status + '\n' + JSON.stringify(response));}
     });
}

function updateShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertUrl(),
        data: JSON.stringify(buildUpdate()),
        contentType: 'application/json',
        success: updateShapesCallback,
        error: function(response, status, asdf){if(globals.debug) console.log("update errors: " + status + '\n' + response);}
    });
}

function insertShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertUrl(),
        data: JSON.stringify(buildInsert()),
        contentType: 'application/json',
         success: updateShapesCallback,
         error: function(response, status, asdf){if(globals.debug) console.log("insert errors: " + status + '\n' + response);}
     });
}

function getmPopup() {
    if(document.getElementById("getmPopupText").classList.toggle("show")) {
        $("#getmPopup").zIndex(2);
    }
}

function mapLayerPopup() {
    if(document.getElementById("mapLayerPopupText").classList.toggle("show")) {
        $("#mapLayerPopup").zIndex(2);
    }
}

function searchFiltersPopup() {
    if(document.getElementById("searchFilterPopupText").classList.toggle("show")) {
        $("#searchFilterPopup").zIndex(2);
    }
}

function debugPopup() {
    if(document.getElementById("debugPopupText").classList.toggle("show")) {
        $("#debugPopup").zIndex(2);
    }
}