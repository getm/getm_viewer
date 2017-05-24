import './layerinfo.css'
import * as $ from 'jquery';
import * as ol from 'openlayers';
import {features} from './draw';
import {utils} from './getmValidation/getmUtils';
import {GeoServerRestInterface} from './gsRestService';

export var layerInfoMap = {};
var required;
    var vals=['benumber', 'osuffix', 'tgt_coor', 'tgt_name', 'catcode', 
    'country', 'label', 'feat_nam', 'out_ty', 'notional', 'ce_l', 'ce_w', 
    'ce_h', 'c_pvchar', 'conf_lvl', 'icod', 'qc_level', 'class', 'release', 
    'control', 'drv_from', 'c_reason', 'decl_on', 'source', 'c_method', 'doi', 
    'c_date', 'circ_er', 'lin_er', 'history', 'producer', 'analyst', 'qc', 'class_by', 'tot','shape'];

    var types=['java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.math.BigDecimal', 'java.math.BigDecimal', 
    'java.math.BigDecimal', 'java.lang.String', 'java.lang.String', 'java.sql.Timestamp', 'java.lang.Short', 'java.lang.String', 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.sql.Timestamp', 
    'java.sql.Timestamp', 'java.math.BigDecimal', 'java.math.BigDecimal', 'java.lang.Short', 'java.lang.Short', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'com.vividsolutions.jts.geom.Geometry'];

function setRequired(response) {
    response = JSON.parse(response);
    required = response['properties']['tm_prime']['required'];
}

export function layerInfoPopup(){
    var layerInfoPopupText = document.getElementById('layerInfoPopupText');
    if(layerInfoPopupText.classList.toggle("show")) {
        // move around the popup
        $(layerInfoPopupText.parentElement).draggable();
        $(layerInfoPopupText.parentElement).resizable({
            handles: 'all'
        });
        $(layerInfoPopupText.parentElement).zIndex(2);
    } 

    var id = (<HTMLInputElement>document.getElementById('tgt_name')).value;
    if(layerInfoMap[id] != undefined)
        retrieveValues();
    else
        fillLayerInfoDefaults();
}

function typeCheck(val, type) {
    switch(type) {
        case 'java.lang.String':
            utils.verifyString(val);
            break;
        case 'java.math.BigDecimal':
            utils.verifyString(val);
            break;
        case 'java.sql.Timestamp':
            utils.verifyString(val);
            break;
        case 'java.lang.Short':
            utils.verifyString(val);
            break;
        case 'com.vividsolutions.jts.geom.Geometry':
            utils.verifyString(val);
            break;
    }
}

function valCheck(fieldName, fieldValue) {
    switch(fieldName) {
    case 'benumber':
        utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'osuffix':
        utils.verifyOSuffix(fieldValue, required.indexOf(fieldName) != -1);
    case 'tgt_coor':
        utils.verifyTgtCoord(fieldValue, required.indexOf(fieldName) != -1);
    case 'tgt_name':
        //utils.verifyString(fieldValue);
    case 'catcode':
        utils.verifyCatcode(fieldValue, required.indexOf(fieldName) != -1);
    case 'country':
        utils.verifyCountry(fieldValue, required.indexOf(fieldName) != -1);
    case 'label':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'feat_nam':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'out_ty':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'notional':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'ce_l':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'ce_w':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    case 'ce_h':
        //utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);                
    case 'c_pvchar':
        utils.verifyBeNumber(fieldValue, required.indexOf(fieldName) != -1);
    }
}

function retrieveValues() {
    var id = (<HTMLInputElement>document.getElementById('tgt_name')).value;
    var fields = {};

    console.log('Map for this layer is: \n' + JSON.stringify(layerInfoMap[id]));
    for(var val in vals){
        if(layerInfoMap[id]['tm_prime']['properties'][vals[val]] != undefined) {
            console.log('layer info of ' + id + ' is ' + layerInfoMap[id]['tm_prime']['properties'][vals[val]]['val']);
            (<HTMLInputElement>document.getElementById(vals[val])).value = layerInfoMap[id]['tm_prime']['properties'][vals[val]]['val'];
        } else {
            (<HTMLInputElement>document.getElementById(vals[val])).value = "";
        }
    }
}

$('#benumber').change(function(){alert('changed');});

function assignValues() {
    var id = (<HTMLInputElement>document.getElementById('tgt_name')).value;
    var fields = {};
    var entry = {};

    for(var val in vals) {
        if((<HTMLInputElement>document.getElementById(vals[val])).value != undefined 
        && (<HTMLInputElement>document.getElementById(vals[val])).value.length > 0 ) {
            try{
                fields[vals[val]] =  {'val' : (<HTMLInputElement>document.getElementById(vals[val])).value, 'type': types[val] };
            } catch(e) {}
        }
    }

    var geojson = new ol.format.GeoJSON().writeFeatureObject(features[id]);
    for(var coordinate in geojson['geometry']['coordinates']) {
        for(var coord in geojson['geometry']['coordinates'][coordinate]) {
            console.log(geojson['geometry']['coordinates'][coordinate][coord]);
            if(typeof geojson['geometry']['coordinates'][coordinate][coord] != 'number')
                geojson['geometry']['coordinates'][coordinate][coord] = normalizeCoord(geojson['geometry']['coordinates'][coordinate][coord]);
        }
    }

    entry['tm_prime'] = {'properties':fields};
    entry['id'] = id;
    entry['geoJson'] = geojson;
    entry['objectID'] = (layerInfoMap[id] == undefined) ? -1 : layerInfoMap[id]['objectID']; // TODO: update flag

    layerInfoMap[id] = entry;
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

// TODO: something about this....
export function fillLayerInfoDefaults() {
    (<HTMLInputElement>document.getElementById('benumber')).value = '0000-00000';
    (<HTMLInputElement>document.getElementById('osuffix')).value = 'AS000';
    (<HTMLInputElement>document.getElementById('tgt_coor')).value = '1.2N 1.2E';
    // (<HTMLInputElement>document.getElementById('tgt_name')).value = 'none';
    (<HTMLInputElement>document.getElementById('catcode')).value = '93434';
    (<HTMLInputElement>document.getElementById('country')).value = 'US';
    (<HTMLInputElement>document.getElementById('label')).value = 'RIDDLER';
    (<HTMLInputElement>document.getElementById('feat_nam')).value = 'FEATURE NAME';
    (<HTMLInputElement>document.getElementById('out_ty')).value = 'none';
    (<HTMLInputElement>document.getElementById('notional')).value = '23f';
    (<HTMLInputElement>document.getElementById('ce_l')).value = '0.0';
    (<HTMLInputElement>document.getElementById('ce_w')).value = '0.0';
    (<HTMLInputElement>document.getElementById('ce_h')).value = '0.0';
    (<HTMLInputElement>document.getElementById('c_pvchar')).value = 'none';
    (<HTMLInputElement>document.getElementById('conf_lvl')).value = 'none';
    // (<HTMLInputElement>document.getElementById('icod')).value = '2017-02-12';
    (<HTMLInputElement>document.getElementById('icod')).value = '02/12/2017';
    (<HTMLInputElement>document.getElementById('qc_level')).value = '0';
    (<HTMLInputElement>document.getElementById('class')).value = 'none';
    (<HTMLInputElement>document.getElementById('release')).value = 'n';
    (<HTMLInputElement>document.getElementById('control')).value = 'none';
    (<HTMLInputElement>document.getElementById('drv_from')).value = 'none';
    (<HTMLInputElement>document.getElementById('c_reason')).value = 'none';
    (<HTMLInputElement>document.getElementById('decl_on')).value = 'none';
    (<HTMLInputElement>document.getElementById('source')).value = 'none';
    (<HTMLInputElement>document.getElementById('c_method')).value = 'none';
    // (<HTMLInputElement>document.getElementById('doi')).value = '2017-02-12';
    (<HTMLInputElement>document.getElementById('doi')).value = '02/12/2017';
    // (<HTMLInputElement>document.getElementById('c_date')).value = '2017-02-12';
    (<HTMLInputElement>document.getElementById('c_date')).value = '02/12/2017';    
    (<HTMLInputElement>document.getElementById('circ_er')).value = '0.0';
    (<HTMLInputElement>document.getElementById('lin_er')).value = '0.0';
    (<HTMLInputElement>document.getElementById('history')).value = '0';
    (<HTMLInputElement>document.getElementById('producer')).value = '0';
    (<HTMLInputElement>document.getElementById('analyst')).value = 'none';
    (<HTMLInputElement>document.getElementById('qc')).value = 'none';
    (<HTMLInputElement>document.getElementById('class_by')).value = 'none';
    (<HTMLInputElement>document.getElementById('tot')).value = 'none';
    (<HTMLInputElement>document.getElementById('shape')).value = '-';

    assignValues();
}

function hideLayerInfoPopup() {
    var layerInfoPopupText = document.getElementById("layerInfoPopupText");
    layerInfoPopupText.classList.toggle("show");
    $(layerInfoPopupText.parentElement).zIndex(-1);
}


function layerInfoSetup(){
    $.ajax({
        type: 'GET',
        url: GeoServerRestInterface.getLayersUrl(),
        success: function(response, status, asdf){setRequired(response);},
        error: function(response, status, asdf){alert("errors: " + status + '\n' + response);}
    });
    var app = document.getElementById("app");
    var layerInfoDiv = document.createElement('div');
    var read = new XMLHttpRequest();
    read.open('GET', 'layerinfo.html', false);
    read.send();
    layerInfoDiv.innerHTML = read.responseText;
    app.appendChild(layerInfoDiv);
    // layerInfoDiv.classList.toggle('show');

    $('#submitlayerinfo').click(assignValues);

    var layerInfoCloseBtn = document.createElement('button');
    layerInfoCloseBtn.className = "close";
    layerInfoCloseBtn.innerHTML = "&times;";
    document.getElementById("layerInfo-close").appendChild(layerInfoCloseBtn);
    layerInfoCloseBtn.onclick = hideLayerInfoPopup;
}

layerInfoSetup();