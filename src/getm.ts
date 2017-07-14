import * as $ from 'jquery';
import 'jqueryui';
import './css/getm.css';
import * as ol from 'openlayers';
import {layerInfoPopup} from './layerinfo'; // to something about this?
import {globals, windowSetup} from './globals';
import {map} from './map';

declare const GeoServerRestInterface;
var SHAPES_LAYER = 2;
var getmDiv;

//sets up getm popup
export function getmSetup() {
    getmDiv = new windowSetup('getm', 'GETM');
    document.getElementById('getmButton').onclick = getmDiv.show;
    var div1 = document.createElement('div');
    div1.id = 'layer';
    div1.align = 'center';
    getmDiv.windowContents.appendChild(div1);

    var span = document.createElement('span'); 
    span.innerHTML = 'Layer:';
    div1.appendChild(span);
    
    var span2 = document.createElement('span');
    div1.appendChild(span2);

    var shapeLayerSelect = document.createElement('select');
    shapeLayerSelect.className = 'shape-layer-select';
    span2.appendChild(shapeLayerSelect);

    var div2 = document.createElement('div');
    getmDiv.windowContents.appendChild(div2);
    getmDiv.shapes = div2;
    setupShapes();
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
                updateEntries.push(shapesID); 
                deleteEntries.push(shapesID);
            }
        }
    }

    var shapeEntries = [insertEntries, updateEntries, deleteEntries];
    var shapeActions = ['insertShapes', 'updateShapes', 'deleteShapes']; 
    var shapesContent = getmDiv.shapes;
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
        input.className ='button';
        input.innerText = shapeActions[a].charAt(0).toUpperCase() + shapeActions[a].replace('Shapes', '').slice(1);
        input.onclick = buttonActions[a];
        div2.appendChild(input);
    }
    map.render();
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

// retrieves selected shapes and formats for ajax insert call
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

// retrieves selected shapes and formats for ajax update call
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

// retrieves selected shapes and formats for ajax delete call
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

// ajax call to delete into the db
function deleteShapes() {
     $.ajax({
         type: 'POST',
         url: GeoServerRestInterface.getPostDeleteUrl(),
         data: JSON.stringify(buildDelete()),
         contentType: 'application/json',
         success: updateShapesCallback,
     });
}

// ajax call to update into the db
function updateShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertAndUpdateUrl(),
        data: JSON.stringify(buildUpdate()),
        contentType: 'application/json',
        success: updateShapesCallback,
    });
}

// ajax call to insert into the db
function insertShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertAndUpdateUrl(),
        data: JSON.stringify(buildInsert()),
        contentType: 'application/json',
         success: updateShapesCallback,
     });
}