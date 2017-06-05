import * as $ from 'jquery';
import 'jqueryui';
import './css/getm.css';
import * as ol from 'openlayers';
import {GeoServerRestInterface} from './gsRestService';
import {layerInfoPopup} from './layerinfo'; // to something about this?
import {getmFiltersSetup} from './getmFilters';
import {layerInfoMap, features, debug} from './globals';
import {currShapeLayer, currGetmLayer, shapeSources} from './map';  // todo: take out shape Sources
// for debugging
document.getElementById('debug').innerHTML = "Debug Texts Go Here";

function loadSession() {
    // clear this session first;
    for (var f in features){
        delete features[f];
        delete layerInfoMap[f];
    }
    if(localStorage.featureArray){
        var fao = new ol.format.KML().readFeatures(localStorage.featureArray);
        for(var i in fao) {
            console.log(fao[i]);
            features[fao[i].getProperties().id] = fao[i]; 
            (<ol.source.Vector>shapeSources[fao[i].getProperties().shapelayer]).addFeature(fao[i]);
        }
    }
    if(localStorage.layerInfoMap){
        var limo = JSON.parse(localStorage.layerInfoMap);
        for(var i in limo) {
            layerInfoMap[limo[i].id] = $.extend(true,{},limo[i]);
        }
    }
}

function saveSession(){
    var featureArray = [];
    for(var f in features) {
        console.log('working on feature ' + f + ' with layer ' + JSON.stringify(layerInfoMap[f]) + ' and shape layer ' + features[f].getProperties()['shapelayer']);
        if(features[f].getProperties()['shapelayer'] == currShapeLayer || currShapeLayer == 'all') {
            featureArray.push(features[f]);
        }
    }                
    localStorage.featureArray = new ol.format.KML().writeFeatures(featureArray);
    localStorage.layerInfoMap = JSON.stringify(layerInfoMap);
    console.log('session saved');
}

function saveShapes(){
    var featureArray = [];
    for(var f in features) {
        if(features[f].getProperties()['shapelayer'] == currShapeLayer || currShapeLayer == 'all') {
            featureArray.push(features[f]);
        }
    }                
    var a = document.createElement('a');
    a.download = 'helloworld.kml';            
    var kml = new ol.format.KML().writeFeatures(featureArray);
    a.href = window.URL.createObjectURL(new Blob([kml], {'type': 'application/octet-stream'}));
    a.click();         
}

// remembers info, regenerate only if changes made to map
export function getmSetup() {
    getmFiltersSetup();

    var btn = document.createElement('button');
    btn.innerText = 'getm';
    document.getElementById('getmButton').appendChild(btn);
    btn.onclick = getmPopup;

    var getmPopupText = document.getElementById("getmPopupText");
    var read = new XMLHttpRequest();
    read.open('GET', 'getm.html', false);
    read.send();
    getmPopupText.innerHTML=read.responseText;
    
    // populate layer select

    // fill out inside of the windows stuff
    setupShapes();

    // TODO: not sure if i need this...
    var getmCloseBtn = document.createElement('button');
    getmCloseBtn.className = "close";
    getmCloseBtn.innerHTML = "&times;";
    document.getElementById("getm-close").appendChild(getmCloseBtn);
    getmCloseBtn.onclick = hidePopup;

    // move around the popup
    $(getmPopupText.parentElement).draggable();
    $(getmPopupText).resizable({
        handles: 'all'
    });
    $('#saveBtn').click(saveShapes);
    $('#saveSessBtn').click(saveSession);
    $('#loadSessBtn').click(loadSession);
    $('#filterSearchBtn').click(search);
}

function search() {
    if($('#catsearch').val()){
        console.log('cat search: ' + $('#catsearch').val());
        for (var i in layerInfoMap) {
            if(layerInfoMap[i][features[i].getProperties()['shapelayer']]['properties']['catcode']['val'] == $('#catsearch').val()) 
            {
                console.log('found: ' + i);
            }
        }
    } else {
        console.log('cat not found');
    }

    if($('#besearch').val()) {
        console.log('be search: ' + $('#besearch').val());
        for (var i in layerInfoMap) {
            var x = [features[i].getProperties()['shapelayer']];
            var y = layerInfoMap[i][features[i].getProperties()['shapelayer']];
            var z = layerInfoMap[i];
            var za = layerInfoMap[i][features[i].getProperties()['shapelayer']]['properties']['benumber']['val'];
            var zb = $('#benumber').val();
            if(layerInfoMap[i][features[i].getProperties()['shapelayer']]['properties']['benumber']['val'] == $('#benumber').val()) 
            {
                console.log('found: ' + i);
            }
        }        
    } else {
        console.log('be not found');
    }
}

// setup shapes 
export function setupShapes() {
    var insertEntries = [];
    var updateEntries = [];
    var deleteEntries = [];

    // sort entries into appropriate columns
    for(var f in features) {
        console.log(currGetmLayer);
        console.log('working on feature ' + f + ' with layer ' + JSON.stringify(layerInfoMap[f]) + ' and shape layer ' + features[f].getProperties()['shapelayer']);
        if(features[f].getProperties()['shapelayer'] == currGetmLayer || currGetmLayer == 'all') {
            console.log('layerinfomap');
            console.log(layerInfoMap);
            if(layerInfoMap[f].objectID == -1)
                insertEntries.push(f);
            else {
                updateEntries.push(f); // TODO: indicate update stuff
                deleteEntries.push(f);
            }
        }
    }

    var shapeEntries = [insertEntries, updateEntries, deleteEntries];
    var shapeActions = ['insertShapes', 'updateShapes', 'deleteShapes']; 
    var shapes = document.getElementById('shapes');
    var buttonActions = [insertShapes, updateShapes, deleteShapes];

    shapes.innerHTML="";
    for(var a in shapeActions) {
        var div0 = document.createElement('div');
        div0.id = shapeActions[a];
        shapes.appendChild(div0);

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

// callback function for database stuffs
function updateShapesCallback(response, status, asdf) {
    if(response!= []) {
        for(var i in response){
            if(debug)
                console.log('old object id is ' + layerInfoMap[response[i]['id']]['objectID'] );

            layerInfoMap[response[i]['id']]['objectID'] = response[i]['objectID'];
            if(debug)
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
        var entry = layerInfoMap[selectedOptions[option].text];
        records.push(JSON.stringify(entry));
    }
    return {'records':records};
}

// TODO: update and insert look almost identical...
// TODO: the return objectid is not looking right....
function buildUpdate() {
    var records = [];
    var updateSelect = document.getElementById('updateShapesSelect');
    var selectedOptions = (<HTMLSelectElement>updateSelect).selectedOptions;

    console.log('selected insert options has this many elements ' + selectedOptions.length);
    for(var option = 0; option < selectedOptions.length; option++) {
        var entry = layerInfoMap[selectedOptions[option].text];
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
        entry['objectID'] =  JSON.stringify(layerInfoMap[selectedOptions[option].text]['objectID']);
        entry['name'] = features[selectedOptions[option].text].getProperties()['shapelayer'];
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
         error: function(response, status, asdf){if(debug) console.log("delete errors: " + status + '\n' + JSON.stringify(response));}
     });
}

function updateShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertUrl(),
        data: JSON.stringify(buildUpdate()),
        contentType: 'application/json',
        success: updateShapesCallback,
        error: function(response, status, asdf){if(debug) console.log("update errors: " + status + '\n' + response);}
    });
}

function insertShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertUrl(),
        data: JSON.stringify(buildInsert()),
        contentType: 'application/json',
         success: updateShapesCallback,
         error: function(response, status, asdf){if(debug) console.log("insert errors: " + status + '\n' + response);}
     });
}

// toggle getm popup
function getmPopup() {
    if(document.getElementById("getmPopupText").classList.toggle("show")) {
        $("#getmPopup").zIndex(2);
    }
}

// do i need this? hidepopup is only called once...
function hidePopup() {
    var getmPopupText = document.getElementById("getmPopupText");
    getmPopupText.classList.toggle("show");
    $(getmPopupText.parentElement).zIndex(-1);
}