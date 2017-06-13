import './css/layerinfo.css'
import * as $ from 'jquery';
import * as ol from 'openlayers';
import {utils} from './getmValidation/getmUtils';
import '../dist/config.js';
import {map, shapeLayer} from './map';
import {globals, windowSetup} from './globals';
import {setupShapes} from './getm';

var required;
var vals=[
    'benumber', 'osuffix', 'tgt_coor', 'tgt_name',
    'catcode', 'country', 'label', 'feat_nam', 'out_ty', 'notional', 'ce_l', 'ce_w', 
    'ce_h', 'c_pvchar', 'conf_lvl', 'icod', /*'qc_level',*/ 'class', 
    'release', 'control', 'drv_from', 'c_reason', 'decl_on', 
    'source', 'c_method', 'doi', 
    'c_date', 'circ_er', 
    'lin_er', /*'history'*/ 'producer', 'analyst', 'qc', 
    'class_by', 'tot','shape', 'chng_req', 'd_state'];

var types=[
    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 

    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.math.BigDecimal', 'java.math.BigDecimal', 
    'java.math.BigDecimal', 'java.lang.String', 'java.lang.String', 'java.sql.Timestamp', /*'java.lang.Short',*/ 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'java.sql.Timestamp', 
    'java.sql.Timestamp', 'java.math.BigDecimal', 
    'java.math.BigDecimal', /*'java.lang.Short',*/ 'java.lang.Short', 'java.lang.String', 'java.lang.String', 
    'java.lang.String', 'java.lang.String', 'com.vividsolutions.jts.geom.Geometry', 'java.lang.String', 'java.lang.Short'];

var errRegex=[
    '[0,1][0-8]\\d{2}[A-Z,-][A-Z,0-9]\\d{4}', '[A-Z]{2}\\d{3}','^(\\d{1,2}[\\d.]{0,1}\\d{0,3})[NS][ ](\\d{1,3}[\\d.]{0,1}\\d{0,3})[EW]', '[A-Z,a-z,0-9,\\s]{1,256}',
    '\\d{5}', '[A-Z]{2}', '[A-Z,a-z,0-9]{1,10}', '[A-Z,a-z,0-9,\\s]{0,254}', '[A-Z,a-z,0-9,\\s]{1,50}', '[A-Z,a-z,0-9,\\s]{1,3}', '[-+]?[0-9]*\\.?[0-9]+', '[-+]?[0-9]*\\.?[0-9]+', 
    '[-+]?[0-9]*\\.?[0-9]+', '[A-Z,a-z,0-9]{1,20}','[A-Z,a-z,0-9]{1,24}', '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])', /** ,*/ '[A-Z,a-z,0-9]{1,12}',
    '[A-Z,a-z,0-9]{1}', '[A-Z,a-z,0-9]{1,32}', '[A-Z,a-z,0-9,\\s]{1,48}', '[A-Z,a-z,0-9,\\s,\(,\),\.]{1,20}', '[2][5][x][1][,][ ]\\d{8}', 
    '[A-Z,a-z,0-9,_]{1,20}', '[A-Z,a-z,0-9,\\s]{1,64}', '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])', 
    '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])', '-1', 
    '-1', /**, */ '\\d{1,3}', '[A-Z,a-z,0-9]{1,50}', '[A-Z,a-z,0-9]{1,50}',
    '[A-Z,a-z,0-9]{1,50}', '\\d{4}[Z]', '[A-Z,a-z,0-9]{1,50}', '[A-Z,a-z,0-9]{1,50}', '\\d{1,3}'
];
var errExample=[
    '1234-12345', 'DD001', '123456N 1234567E', 'SPIRIT OF ST LOUIS AIR PORT',
    '80000', 'US', 'label', 'Runway', 'Installation', 'Yes',  '4000', '100', 
    '0', 'RC', 'Confirmed', '1/30/2015', /* ,*/ 'UNCLASSIFIED', 
    'x', 'control', 'GEOINT SCG Annex', '1.4 (a)(c)(g)', '25x1, 20400210',
    '25MAR07IK0101063po', 'Stereo DPPDB collection', '03/25/2007',
    '6/13/2017', '-1',
    '-1', /**/ '1', '1234567', '1234567',
    '1234567', '1259Z', 'shape', 'ABCD01', '12'
];

function matchRegex(r, s) {
   var match = s.match(r);
   console.log('match reads' + match);
   return match != null && s == match[0];
}

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
        validateLayerInfo(vals[val]); 
     
    $('#layerInfoPopupText').addClass('show');
    $('#layerInfoPopup').zIndex(2);     
}

function typeCheck(val) {
    var correct;
    if(val != undefined) {
        console.log('checking for matches for ' + val.value.trim());
        console.log(new RegExp(errRegex[vals.indexOf(val.id)]));
        console.log(matchRegex(new RegExp(errRegex[vals.indexOf(val.id)]), val.value.trim()));
        return matchRegex(new RegExp(errRegex[vals.indexOf(val.id)]), val.value.trim());
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

    for(var val in vals){
        (<HTMLInputElement>document.getElementById(vals[val])).value = errExample[val];
    }
    (<HTMLInputElement>document.getElementById('layerinfolayer')).value = shapeLayer.get('name');
    (<HTMLInputElement>document.getElementById('tgt_name')).value = globals.selectedFeatureID;

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

        var msglabelcontainer = document.createElement('div');
        msglabelcontainer.className='label';
        div.appendChild(msglabelcontainer);

        var label = document.createElement('span');
        label.innerHTML = vals[val].charAt(0).toUpperCase() + vals[val].slice(1) + ': ';
        label.className = '';
        msglabelcontainer.appendChild(label);

        var msg = document.createElement('span');
        msg.className = 'msg';
        msg.id = vals[val] + '-msg';
        msglabelcontainer.appendChild(msg);
        
        var input = document.createElement('input');
        input.type = 'text';
        input.id = vals[val];
        input.placeholder = vals[val];
        input.onchange = function(){
            validateLayerInfo(this.id);
        }
        div.appendChild(input);

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

function validateLayerInfo(val) {
    // correct 
    if(typeCheck((<HTMLInputElement>document.getElementById(val)))) {
        console.log('corrected ' + val);
        (<HTMLInputElement>document.getElementById(val)).classList.remove('wrong')
    // incorrect and not marked as wrong
    } else if(!(<HTMLInputElement>document.getElementById(val)).classList.contains('wrong')) {
        console.log('marking as incorrect');
        (<HTMLInputElement>document.getElementById(val)).classList.add('wrong');
        document.getElementById(val+'-msg').className = 'msg';
    } else console.log('still wrong');

    if ((<HTMLInputElement>document.getElementById(val)).classList.contains('wrong')){
        console.log('writing err msg');
        document.getElementById(val + '-msg').innerHTML='correct syntax is <br/> '
        + '<b>Regex:</b> ' + errRegex[vals.indexOf(val)] + '<br/>' 
        + '<b>Example:</b> ' + errExample[vals.indexOf(val)];
    }  else {
        console.log('undoing stuff')
        document.getElementById(val + '-msg').innerHTML='';
    }
}