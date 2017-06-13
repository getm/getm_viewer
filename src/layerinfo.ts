import './css/layerinfo.css'
import * as $ from 'jquery';
import * as ol from 'openlayers';
import {utils} from './getmValidation/getmUtils';
import {GeoServerRestInterface} from '../dist/config.js';
import {map, shapeLayer} from './map';
import {globals, windowSetup} from './globals';
import {setupShapes} from './getm';

var required;
var vals=['benumber', 'osuffix', 'tgt_coor', 'tgt_name', 'catcode', 
    'country', 'label', 'feat_nam', 'out_ty', 'notional', 'ce_l', 'ce_w', 
    'ce_h', 'c_pvchar', 'conf_lvl', 'icod', 'qc_level', 'class', 'release', 
    'control', 'drv_from', 'c_reason', 'decl_on', 'source', 'c_method', 'doi', 
    'c_date', 'circ_er', 'lin_er', /*'history'*/, 'producer', 'analyst', /*'qc',*/ 'class_by', 
    'tot','shape', 'chng_req', 'd_state'];

var types=['java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.math.BigDecimal', 'java.math.BigDecimal', 
    'java.math.BigDecimal', 'java.lang.String', 'java.lang.String', 'java.sql.Timestamp', 'java.lang.Short', 'java.lang.String', 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.sql.Timestamp', 
    'java.sql.Timestamp', 'java.math.BigDecimal', 'java.math.BigDecimal', /*'java.lang.Short',*/ 'java.lang.Short', 'java.lang.String', /*'java.lang.String',*/ 'java.lang.String', 
    'java.lang.String', 'com.vividsolutions.jts.geom.Geometry', 'java.lang.String', 'java.lang.Short'];

var errMsg=[
    'Regex: /[0,1][0.8]\d{2}[A-Z,-][A-Z,0-9]\d{4}/ <br/>Example: 1234-12345'
];

function setRequired(response) {
    response = JSON.parse(response);
    response.required.push('benumber'); // TODO: remove
    required = response.required;
}

export function layerInfoPopup(){
    if(globals.shapes[globals.selectedFeatureID].getProperties() != undefined)
        retrieveValues();
    else
        fillLayerInfoDefaults();
        //clearLayerInfoContents();
    (<HTMLInputElement>document.getElementById('tgt_name')).value = globals.selectedFeatureID;   
    for(var val in vals) 
        validateLayerInfo(vals[val], types[val]); 
     
    $('#layerInfoPopupText').addClass('show');
    $('#layerInfoPopup').zIndex(2);     
}

function typeCheck(val, type) {
    var correct;
    if(val != undefined) {
        switch(val.id) {
            case 'benumber':
                correct = utils.verifyBeNumber(val, required.indexOf(val.id) != -1);
                document.getElementById('benumber-msg').innerHTML = '';
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
    (<HTMLSelectElement>document.getElementById('layerinfolayer')).value = globals.shapes[id].getLayer().get('name');
}

function assignValues() {
    var id = (<HTMLInputElement>document.getElementById('tgt_name')).value;
    var fields = {};
    var entry = {};

    for(var val in vals) {
        if(id != undefined && id.length > 0 ) {
            try{
                fields[vals[val]] =  {'val' : (<HTMLInputElement>document.getElementById(vals[val])).value, 'type': types[val] };
            } catch(e) {
                console.log('exception in assigning ' + (<HTMLInputElement>document.getElementById(vals[val])).value + ' field ' + vals[val]);
            }
        }
    }

    // setting variable name
    if(id != globals.selectedFeatureID) {
        if(globals.shapes[id] == undefined) {
            globals.shapes[globals.selectedFeatureID].getFeature().set('id', id);
            var temp = globals.shapes[globals.selectedFeatureID];
            delete globals.shapes[globals.selectedFeatureID];
            globals.shapes[id] = temp;
        } else {
            // don't write over what currently exists
            (<HTMLInputElement>document.getElementById('tgt_name')).value = globals.selectedFeatureID;
        }
    }

    var feature = globals.shapes[id].getFeature();
    // setting shape layer
    if(globals.shapes[id].getLayer() != shapeLayer) {
        globals.shapes[id].getLayer().getSource().removeFeature(globals.shapes[id].getFeature());
        globals.shapes[id].setLayer(shapeLayer);
        globals.shapes[id].getLayer().getSource().addFeature(globals.shapes[id].getFeature());
    }
    globals.shapes[id].setProperties(fields);
    setupShapes();
    console.log('assigned values to ' + id);
}

function clearLayerInfoContents() {
    for(var val in vals) {
        (<HTMLInputElement>document.getElementById(vals[val])).value ="";
    }
}

// TODO: something about this....
function fillLayerInfoDefaults() {
    (<HTMLInputElement>document.getElementById('layerinfolayer')).value = shapeLayer.get('name');
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
    (<HTMLInputElement>document.getElementById('decl_on')).value = '';
    (<HTMLInputElement>document.getElementById('source')).value = 'none';
    (<HTMLInputElement>document.getElementById('c_method')).value = 'none';
    // (<HTMLInputElement>document.getElementById('doi')).value = '2017-02-12';
    (<HTMLInputElement>document.getElementById('doi')).value = '02/12/2017';
    // (<HTMLInputElement>document.getElementById('c_date')).value = '2017-02-12';
    (<HTMLInputElement>document.getElementById('c_date')).value = '02/12/2017';    
    (<HTMLInputElement>document.getElementById('circ_er')).value = '0.0';
    (<HTMLInputElement>document.getElementById('lin_er')).value = '0.0';
    //(<HTMLInputElement>document.getElementById('history')).value = '0';
    (<HTMLInputElement>document.getElementById('producer')).value = '1';
    (<HTMLInputElement>document.getElementById('analyst')).value = 'none';
    //(<HTMLInputElement>document.getElementById('qc')).value = 'none';
    (<HTMLInputElement>document.getElementById('class_by')).value = 'none';
    (<HTMLInputElement>document.getElementById('tot')).value = '';
    (<HTMLInputElement>document.getElementById('shape')).value = '-';
    (<HTMLInputElement>document.getElementById('chng_req')).value = 'none';
    (<HTMLInputElement>document.getElementById('d_state')).value = '0';

    assignValues();
}

function hideLayerInfoPopup() {
    var layerInfoPopupText = document.getElementById("layerInfoPopupText");
    $(layerInfoPopupText).removeClass('show');
    $(layerInfoPopupText.parentElement).zIndex(-1);
}

export function layerInfoSetup(){
    $.ajax({
        type: 'GET',
        url: GeoServerRestInterface.getLayersUrl(),
        success: function(response, status, asdf){setRequired(response);},
    });

    var app = document.getElementById('app');
    var layerInfoDiv = windowSetup('layerInfo');
    app.appendChild(layerInfoDiv);

    var layerInfoContents = document.getElementById('layerInfo-contents');
    var layerInfoForm = document.createElement('form');
    layerInfoForm.id = 'layerInfoForm';
    layerInfoContents.appendChild(layerInfoForm);

    var div = document.createElement('div');
    layerInfoForm.appendChild(div);

    var shapeLayerSelect = document.createElement('select');
    shapeLayerSelect.className = "shape-layer-select";
    shapeLayerSelect.id = "layerinfolayer";
    div.appendChild(shapeLayerSelect);

    for(var val in vals) {
        var div = document.createElement('div');
        layerInfoForm.appendChild(div);

        var input = document.createElement('input');
        input.type = 'text';
        input.id = vals[val];
        input.placeholder = vals[val];
        input.onchange = function(){
            validateLayerInfo(this.id, types[vals.indexOf(this.id)]);
            if (this.classList.contains('wrong')){
                document.getElementById(this.id + '-msg').innerHTML="Wrong: correct syntax is " + '<correct syntax>';
            }
        }
        div.appendChild(input);

        var msg = document.createElement('div');
        msg.className = 'msg';
        msg.id = vals[val] + '-msg';
        div.appendChild(msg);

        var br = document.createElement('br');
        div.appendChild(br);
    }

    var div2 = document.createElement('div');
    layerInfoForm.appendChild(div2);

    var submit = document.createElement('input');
    submit.type = 'button';
    submit.id = 'submitlayerinfo';
    submit.value = 'Submit';
    div2.appendChild(submit);
    $('#submitlayerinfo').click(function(){
        assignValues();
        //hideLayerInfoPopup();
    });

    map.getViewport().addEventListener('contextmenu', function (e) {
        e.preventDefault();
        var feature = map.forEachFeatureAtPixel(map.getEventPixel(e),
            function (feature, layer) {
                return feature;
        });
        if (feature) {
            globals.selectedFeatureID = feature.get('id');
            layerInfoPopup();
        }

    });

}

function validateLayerInfo(val, t) {
    // correct 
    if(typeCheck((<HTMLInputElement>document.getElementById(val)), t)) {
        (<HTMLInputElement>document.getElementById(val)).className.replace(' wrong','')
    // incorrect and not marked as wrong
    } else if((<HTMLInputElement>document.getElementById(val)).className.indexOf(' wrong') !== -1) {
        (<HTMLInputElement>document.getElementById(val)).className = (<HTMLInputElement>document.getElementById(val)).className + ' wrong';
        document.getElementById(val+'-msg').className = 'msg';
    }
}