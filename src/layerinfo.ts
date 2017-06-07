import './css/layerinfo.css'
import * as $ from 'jquery';
import * as ol from 'openlayers';
import {utils} from './getmValidation/getmUtils';
import {GeoServerRestInterface} from './gsRestService';
import {map, shapeLayer} from './map';
import {globals} from './globals';

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
    response.required.push('benumber'); // TODO: remove
    required = response.required;
}

export function layerInfoPopup(){
    $('#layerInfoPopupText').addClass('show');
    $('#layerInfoPopup').zIndex(2);
    var id = globals.selectedFeatureID;
    if(globals.shapes[id].getProperties() != undefined)
        retrieveValues();
    else
        fillLayerInfoDefaults();
}

function typeCheck(val, type) {
    var correct;
    if(val != undefined) {
        switch(val.id) {
            case 'benumber':
                correct = utils.verifyBeNumber(val, required.indexOf(val.id) != -1);
                break;
            case 'osuffix':
                correct = utils.verifyOSuffix(val, required.indexOf(val.id) != -1);
                break;
            case 'tgt_coor':
                correct = utils.verifyTgtCoord(val, required.indexOf(val.id) != -1);
                break;
            case 'catcode':
                correct = utils.verifyCatcode(val, required.indexOf(val.id) != -1);
                break;
            case 'country':
                correct = utils.verifyCountry(val, required.indexOf(val.id) != -1);
                break;
            case 'decl_on':
                correct = utils.verifyDeclassifyOn(val, required.indexOf(val.id) != -1);
                break;
            case 'tot':
                correct = utils.verifyTimeOverTarget(val, required.indexOf(val.id) != -1);
                break;
        }
        if(correct == undefined) {
            switch(type) {
                case 'java.lang.String':
                    correct = utils.verifyString(val);
                    break;
                case 'java.math.BigDecimal':
                    correct = utils.verifyBigDecimal(val);
                    break;
                case 'java.sql.Timestamp':
                    correct = utils.verifyDate(val, required.indexOf(val.id) != -1);
                    break;
                case 'java.lang.Short':
                    correct = utils.verifyShort(val);
                    break;
                case 'com.vividsolutions.jts.geom.Geometry':
                    correct = utils.verifyString(val);
                    break;
            }
        }
    }
    return correct;
}

function retrieveValues() {
    var id = globals.selectedFeatureID;
    for(var val in vals){
        if(globals.shapes[id].getProperties()[vals[val]] != undefined) {
            (<HTMLInputElement>document.getElementById(vals[val])).value = globals.shapes[id].getProperties()[vals[val]]['val'];
        } else {
            (<HTMLInputElement>document.getElementById(vals[val])).value = "";
        }
    }
    (<HTMLSelectElement>(document.getElementById('layerinfolayer')).firstChild).value = globals.shapes[id].getLayer().get('name');
}

function assignValues() {
    var id = globals.selectedFeatureID;
    var fields = {};
    var entry = {};

    for(var val in vals) {
        if((<HTMLInputElement>document.getElementById(vals[val])).value != undefined 
        && (<HTMLInputElement>document.getElementById(vals[val])).value.length > 0 ) {
            try{
                fields[vals[val]] =  {'val' : (<HTMLInputElement>document.getElementById(vals[val])).value, 'type': types[val] };
            } catch(e) {
                console.log('exception in assigning ' + id + ' field ' + vals[val]);
            }
        }
    }
    
    var feature = globals.shapes[id].getFeature();
    if(globals.shapes[id].getLayer() != shapeLayer) {
        console.log('layers are different');
        globals.shapes[id].getLayer().getSource().removeFeature(globals.shapes[id].getFeature());
        globals.shapes[id].setLayer(shapeLayer);
        globals.shapes[id].getLayer().getSource().addFeature(globals.shapes[id].getFeature());
    }
    globals.shapes[id].setProperties(fields);
    console.log('assigned values to ' + id);
}

// TODO: something about this....
export function fillLayerInfoDefaults() {
    (<HTMLInputElement>(document.getElementById('layerinfolayer').firstChild)).value = shapeLayer.get('name');
    console.log('curr shape layer is ' + shapeLayer.get('name'));
    (<HTMLInputElement>document.getElementById('benumber')).value = '0000-00000';
    (<HTMLInputElement>document.getElementById('osuffix')).value = 'AS000';
    (<HTMLInputElement>document.getElementById('tgt_coor')).value = '1.2N 1.2E';
    (<HTMLInputElement>document.getElementById('tgt_name')).value = globals.selectedFeatureID;
    (<HTMLInputElement>document.getElementById('catcode')).value = '93434';
    (<HTMLInputElement>document.getElementById('country')).value = 'US';
    (<HTMLInputElement>document.getElementById('label')).value = 'RIDDLER';
    (<HTMLInputElement>document.getElementById('feat_nam')).value = 'FEATURE NAME';
    (<HTMLInputElement>document.getElementById('out_ty')).value = 'outlinetype1';
    (<HTMLInputElement>document.getElementById('notional')).value = 'yes';
    (<HTMLInputElement>document.getElementById('ce_l')).value = '0.0';
    (<HTMLInputElement>document.getElementById('ce_w')).value = '0.0';
    (<HTMLInputElement>document.getElementById('ce_h')).value = '0.0';
    (<HTMLInputElement>document.getElementById('c_pvchar')).value = 'as';
    (<HTMLInputElement>document.getElementById('conf_lvl')).value = 'Confirmed';
    // (<HTMLInputElement>document.getElementById('icod')).value = '2017-02-12';
    (<HTMLInputElement>document.getElementById('icod')).value = '02/12/2017';
    (<HTMLInputElement>document.getElementById('qc_level')).value = '0';
    (<HTMLInputElement>document.getElementById('class')).value = 'UNCLASSIFIED';
    (<HTMLInputElement>document.getElementById('release')).value = 'x';
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
    (<HTMLInputElement>document.getElementById('producer')).value = '1';
    (<HTMLInputElement>document.getElementById('analyst')).value = 'none';
    (<HTMLInputElement>document.getElementById('qc')).value = 'none';
    (<HTMLInputElement>document.getElementById('class_by')).value = 'none';
    (<HTMLInputElement>document.getElementById('tot')).value = 'none';
    (<HTMLInputElement>document.getElementById('shape')).value = '-';

    assignValues();
}

function hideLayerInfoPopup() {
    var layerInfoPopupText = document.getElementById("layerInfoPopupText");
    $(layerInfoPopupText).removeClass('show');
    $(layerInfoPopupText.parentElement).zIndex(-1);
}

function assignAndClose(){
    var form =  document.getElementById('layerinfoform'); 
    var s = 'form has ' + form.children.length + ' stuffs<br/>'
    for(var i = 0; i < form.children.length-1; i++) {
        s = s +'child ' + (i+1) + ' is ' + (<HTMLElement>(form.children[i].firstChild)).id + ': ' + (<HTMLInputElement>(form.children[i].firstChild)).value 
        + ' with type ' + (<HTMLInputElement>(form.children[i].firstChild)).type +'<br/>'
    }
    document.getElementById('debug').innerHTML = s;

    assignValues();
    hideLayerInfoPopup();
}

export function layerInfoSetup(){
    $.ajax({
        type: 'GET',
        url: GeoServerRestInterface.getLayersUrl(),
        success: function(response, status, asdf){setRequired(response); console.log('response reads'); console.log(JSON.parse(response))},
        error: function(response, status, asdf){console.log("errors: " + status + '\n' + response);}
    });
    var app = document.getElementById("app");
    var layerInfoDiv = document.createElement('div');
    var read = new XMLHttpRequest();
    read.open('GET', 'layerinfo.html', false);
    read.send();
    layerInfoDiv.innerHTML = read.responseText;
    app.appendChild(layerInfoDiv);

    $('#submitlayerinfo').click(assignAndClose);

    var layerInfoCloseBtn = document.createElement('button');
    layerInfoCloseBtn.className = "close";
    layerInfoCloseBtn.innerHTML = "&times;";
    document.getElementById("layerInfo-close").appendChild(layerInfoCloseBtn);
    layerInfoCloseBtn.onclick = hideLayerInfoPopup;

    $('#layerInfoPopup').draggable();
    $('#layerInfoPopupText').resizable({
        handles: 'all'
    });

    map.getViewport().addEventListener('contextmenu', function (e) {
        e.preventDefault();
        var feature = map.forEachFeatureAtPixel(map.getEventPixel(e),
            function (feature, layer) {
                console.log('context menu pls');
                console.log(feature);
                return feature;
        });
        if (feature) {
            globals.selectedFeatureID = feature.get('id');
            layerInfoPopup();
        }

    });
    for(var val in vals){
        (<HTMLInputElement>document.getElementById(vals[val])).onchange = function(){
            validateLayerInfo(this.id, types[vals.indexOf(this.id)]);
        }

    }
}

function validateLayerInfo(val, t) {
    // correct
    if(typeCheck((<HTMLInputElement>document.getElementById(val)), t))
        (<HTMLInputElement>document.getElementById(val)).className.replace(' wrong','')
    // incorrect and not marked as wrong
    else if((<HTMLInputElement>document.getElementById(val)).className.indexOf(' wrong') !== -1)
        (<HTMLInputElement>document.getElementById(val)).className = (<HTMLInputElement>document.getElementById(val)).className + ' wrong';
}

