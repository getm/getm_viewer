import './css/layerinfo.css'
import * as $ from 'jquery';
import * as ol from 'openlayers';
import {map} from './map';
import {globals, windowSetup} from './globals';
import {setupShapes} from './getm';
import {Shape} from './Shape'
declare const GeoServerRestInterface;
var required;

// list of each of the layer info fields
var layerInfoRequirements = [
    { // benumber
        val: 'benumber',
        type: 'java.lang.String',
        regex: '[0,1][0-8]\\d{2}[A-Z,-][A-Z,0-9]\\d{4}',
        example: '1234-12345'
    },
    { // osuffix
        val: 'osuffix',
        type: 'java.lang.String',
        regex: '[A-Z]{2}\\d{3}',
        example: 'DD001'
    },
    { // tgt_coor
        val: 'tgt_coor',
        type: 'java.lang.String',
        regex: '^(\\d{1,2}[\\d.]{0,1}\\d{0,3})[NS][ ](\\d{1,3}[\\d.]{0,1}\\d{0,3})[EW]',
        example: '123456N 1234567E'
    },
    { // tgt_name
        val: 'tgt_name',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,256}',
        example: 'SPIRIT OF ST LOUIS AIR PORT'
    },
    { // catcode
        val: 'catcode',
        type: 'java.lang.String',
        regex: '\\d{5}',
        example: '80000'
    },
    { // country
        val: 'country',
        type: 'java.lang.String',
        regex: '[A-Z,a-z]{2}',
        example: 'US'
    },
    { // label
        val: 'label',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,10}',
        example: 'label'
    },      
    { // feat_name
        val: 'feat_name',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{0,254}',
        example: 'Runway'
    },
    { // out_ty
        val: 'out_ty',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,50}',
        example: 'Installation',
        options: ['Installation', 'Facility', 'Functional Area', 'Critical Element', 'Element', 'Collateral area', 'POI']
    },
    { // notional
        val: 'notional',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,3}',
        example: 'Yes',
        options: ['Yes','No']
    },
    { // ce_l
        val: 'ce_l',
        type: '[-+]?[0-9]*\\.?[0-9]+',
        regex: '[A-Z,a-z,0-9]{1,10}',
        example: '4000'
    },      
    { // ce_w
        val: 'ce_w',
        type: '[-+]?[0-9]*\\.?[0-9]+',
        regex: '[A-Z,a-z,0-9]{1,10}',
        example: '100'
    },
    { // ce_h
        val: 'ce_h',
        type: 'java.math.BigDecimal',
        regex: '[-+]?[0-9]*\\.?[0-9]+',
        example: '0'
    },
    { // c_pvchar
        val: 'c_pvchar',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,20}',
        example: 'RC'
    },
    { // conf_lvl
        val: 'conf_lvl',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,24}',
        example: 'Confirmed',
        options: ['Confirmed', 'Probable', 'Possible']
    },      
    { // icod
        val: 'icod',
        type: 'java.sql.Timestamp',
        regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
        example: '1/30/2015'
    },      
    { // class
        val: 'class',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,12}',
        example: 'UNCLASSIFIED',
        options: ['UNCLASSIFIED', 'SECRET', ' TOP SECRET']
    },      
    { // release
        val: 'release',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1}',
        example: 'X',
        options: ['X', 'A', 'B', 'C', 'D']
    },      
    { // control
        val: 'control',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,32}',
        example: 'control'
    },      
    { // drv_from
        val: 'drv_from',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,48}',
        example: 'GEOINT SCG Annex',
        options: ['GEOINT SCG Annex','TARGET Materials SCG, 3 March 2015']
    },      
    { // c_reason
        val: 'c_reason',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s,\(,\),\.]{1,20}',
        example: '1.4 (a)(c)(g)',
        options: ['1.4 (a)(c)(g)']
    },      
    { // decl_on
        val: 'decl_on',
        type: 'java.lang.String',
        regex: '[2][5][x][1][,][ ]\\d{8}',
        example: '25x1, 20400210'             
    },      
    { // source
        val: 'source',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,_]{1,20}',
        example: '25MAR07IK0101063po'     
    },      
    { // c_method
        val: 'c_method',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,64}',
        example: 'Stereo DPPDB collection',
        options: ['Terrain Corrected Mono Collection', 'Stereo DPPDB collection']  
    },      
    { // doi
        val: 'doi',
        type: 'java.sql.Timestamp',
        regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
        example: '03/25/2007'     
    },      
    { // c_date
        val: 'c_date',
        type: 'java.sql.Timestamp',
        regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
        example: '6/13/2017'     
    },      
    { // circ_er
        val: 'circ_er',
        type: 'java.math.BigDecimal',
        regex: '-1',
        example: '-1'     
    },      
    { // lin_er
        val: 'lin_er',
        type: 'java.math.BigDecimal',
        regex: '-1',
        example: '-1'     
    },      
    { // producer
        val: 'producer',
        type: 'java.lang.Short',
        regex: '\\d{1,3}',
        example: '1',
        options: [1, 2, 3, 4, 5, 6, 7, 8] 
    },      
    { // analyst
        val: 'analyst',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: '1234567'    
    },      
    { // qc
        val: 'qc',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: '1234567'    
    },      
    { // class_by
        val: 'class_by',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: '1234567'    
    },      
    { // tot
        val: 'tot',
        type: 'java.lang.String',
        regex: '\\d{4}[Z]',
        example: '1259Z'    
    },      
    { // shape
        val: 'shape',
        type: 'com.vividsolutions.jts.geom.Geometry',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: 'shape'       
    },      
    { // chng_req
        val: 'chng_req',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: 'ABCD01'  
    },      
    { // d_state
        val: 'd_state',
        type: 'java.lang.Short',
        regex: '\\d{1,3}',
        example: '12'                                                                                                                                                  
    }            
];

// returns whether string s follows regex r's pattern
function matchRegex(r, s) {
   var match = s.match(r);
   return match != null && s == match[0];
}

// retrieve required fields to fill out for 
function retrieveRequiredFields(){
    $.ajax({
        type: 'GET',
        url: GeoServerRestInterface.getLayersUrl(),
        success: function(response, status, xhr){setRequiredFields(response);},
    });
}

// set required fields
function setRequiredFields(response) {
    response = JSON.parse(response);
    required = response.required;
}

// set layerinfo popup's layer value
function retrieveLayer() {
    if(globals.shapes[globals.selectedFeatureID] != undefined) { // shapes layer
        $('#layerinfolayerwfs').addClass('hide');
        $('#layerinfolayer').removeClass('hide');
        (<HTMLSelectElement>document.getElementById('layerinfolayer')).value = globals.shapes[globals.selectedFeatureID].getLayer().get('name');  
    } else { // wfs layer
        $('#layerinfolayer').addClass('hide');
        $('#layerinfolayerwfs').removeClass('hide');
        (<HTMLInputElement>document.getElementById('layerinfolayerwfs')).value = globals.selectedFeature.getProperties()['layer'];
    }
}

// retrieves target name
function retrieveTgtName(){
    (<HTMLInputElement>document.getElementById('tgt_name')).value =  globals.selectedFeatureID; 
}

// displays and fills out layerInfo popup
export function layerInfoPopup(){
    if(globals.shapes[globals.selectedFeatureID] == undefined || globals.shapes[globals.selectedFeatureID].getProperties() == undefined) {
         //fillLayerInfoDefaults();
        clearLayerInfoContents();
        retrieveValidProperties();
        retrieveTgtName();  
    } else
        retrieveValues();

    // validate information, scroll to top, and display
    layerInfoRequirements.forEach(validateLayerInfo);
    $('#layerInfo-contents').scrollTop(0);
    $('#layerInfoPopupText').addClass('show');
    $('#layerInfoPopup').zIndex(2);     
}

// retrieves values from globals.shapes to fill out layerInfo popup
function retrieveValues() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        if(globals.shapes[globals.selectedFeatureID].getProperties()[layerInfoReq.val] != undefined) {
            (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = globals.shapes[globals.selectedFeatureID].getProperties()[layerInfoReq.val]['val'];
        } else {
            (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = "";
        }
    });
    retrieveLayer();
}

// assigns values from feature and layerInfo popup to globals.shapes(shape) or features(wfs/others)
function assignValues() {
    var id = (<HTMLInputElement>document.getElementById('tgt_name')).value;
    var fields = {};
    var entry = {};

    layerInfoRequirements.forEach(function(layerInfoReq){
        if(id != undefined && id.length > 0 ) {
            try {
                if((<HTMLInputElement>document.getElementById(layerInfoReq.val)).value.length > 0
                && !(<HTMLInputElement>document.getElementById(layerInfoReq.val)).classList.contains('wrong'))
                    fields[layerInfoReq.val] =  {'val' : (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value, 'type': layerInfoReq.type };
            } catch(e) {
                console.log('exception in assigning ' + (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value + ' field ' + layerInfoReq.val);
            }
        }
    });

    // CASE: shape
    if(globals.shapes[globals.selectedFeatureID] != undefined) {
        // setting variable name
        if(id != globals.selectedFeatureID) {
            if(globals.shapes[id] == undefined) {
                globals.shapes[globals.selectedFeatureID].getFeature().setProperties({'id': id});
                globals.shapes[id] = globals.shapes[globals.selectedFeatureID];
                delete globals.shapes[globals.selectedFeatureID];
                globals.selectedFeatureID = id;
            } else {
                // don't write over what currently exists
                retrieveTgtName();  
            }
        }
        var feature = globals.shapes[id].getFeature();
        // setting shape layer
        if(globals.shapes[id].getLayer() != globals.shapeLayer) {
            globals.shapes[id].getLayer().getSource().removeFeature(globals.shapes[id].getFeature());
            globals.shapes[id].setLayer(globals.shapeLayer);
            globals.shapes[id].getLayer().getSource().addFeature(globals.shapes[id].getFeature());
        }
        globals.shapes[id].setProperties(fields);
        setupShapes();
    // CASE: wfs
    } else {
        if(id != globals.selectedFeatureID) {
            if(globals.shapes[id] == undefined) {
                globals.selectedFeature.setProperties({'id': id});
                globals.selectedFeatureID = id;
            } else {
                // don't write over what currently exists
                retrieveTgtName();  
            }
        }        
        var properties = {};
        layerInfoRequirements.forEach(function(layerInfoReq){
            if((<HTMLInputElement>document.getElementById(layerInfoReq.val)).value.length > 0
                && !(<HTMLInputElement>document.getElementById(layerInfoReq.val)).classList.contains('wrong'))
                properties[layerInfoReq.val] = (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value;
        });
        globals.selectedFeature.setProperties(properties);
    }
}

// blank slate with layerInfo popup
function clearLayerInfoContents() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value ="";
    });
}

// retrieves valid property from feature to layerInfo popup
function retrieveValidProperties() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        // this is a shape
        if(globals.shapes[globals.selectedFeatureID] != undefined 
        && (globals.shapes[globals.selectedFeatureID].getFeature().getProperties()[layerInfoReq.val] != undefined)) {
            (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = globals.shapes[globals.selectedFeatureID].getFeature().getProperties()[layerInfoReq.val];
        } else if (globals.selectedFeature != undefined 
        // this is wfs
        && globals.selectedFeature.getProperties()['id'] == globals.selectedFeatureID 
        &&  globals.selectedFeature.get(layerInfoReq.val)!= undefined) {
            (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = globals.selectedFeature.getProperties()[layerInfoReq.val];
        } else {
            (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = "";
        }        
    });    
    retrieveLayer();
}

// fill in default values for layerInfo popup
function fillLayerInfoDefaults() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = layerInfoReq.example;
    });
    retrieveLayer();
    retrieveTgtName();  
    assignValues();
}

// sets up layerInfo popup and feature info popup and assigns functionality to buttons
export function layerInfoSetup(){
    retrieveRequiredFields();
    featureInfoSetup();
    var app = document.getElementById('app');
    var layerInfoDiv = windowSetup('layerInfo', 'Layer Information');
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

    var wfsLayerInput = document.createElement('input');
    wfsLayerInput.type = "text";
    wfsLayerInput.disabled = true;
    wfsLayerInput.id = "layerinfolayerwfs";
    div.appendChild(wfsLayerInput);

    layerInfoRequirements.forEach(function(layerInfoReq){
        var div = document.createElement('div');
        layerInfoForm.appendChild(div);

        var msglabelcontainer = document.createElement('div');
        msglabelcontainer.className='label';
        div.appendChild(msglabelcontainer);

        var label = document.createElement('span');
        label.innerHTML = layerInfoReq.val.charAt(0).toUpperCase() + layerInfoReq.val.slice(1) + ': ';
        label.className = '';
        msglabelcontainer.appendChild(label);

        var msg = document.createElement('span');
        msg.className = 'msg';
        msg.id = layerInfoReq.val + '-msg';
        msglabelcontainer.appendChild(msg);
        
        // form entry is input
        if(layerInfoReq['options'] == undefined) {
            var input = document.createElement('input');
            input.type = 'text';
            input.id = layerInfoReq.val;
            input.placeholder = layerInfoReq.val;
            input.onchange = function(){
                validateLayerInfo(layerInfoReq);
            }
            div.appendChild(input);
        // form entry is select
        } else {
            var select = document.createElement('select');
            select.id = layerInfoReq.val;
            select.placeholder = layerInfoReq.val;
            layerInfoReq['options'].forEach(function(option){
                var opt = document.createElement('option');
                opt.value = option;
                opt.innerHTML = option;
                select.appendChild(opt);
            });
            select.onchange = function(){
                validateLayerInfo(layerInfoReq);
            }
            div.appendChild(select);
        }

        var br = document.createElement('br');
        div.appendChild(br);
    });

    var div2 = document.createElement('div');
    layerInfoForm.appendChild(div2);

    var submit = document.createElement('input');
    submit.type = 'button';
    submit.id = 'submitlayerinfo';
    submit.value = 'Submit';
    div2.appendChild(submit);
    $('#submitlayerinfo').click(function(){
        assignValues();
    });

    $('#layerInfo-close').click(function(){
        $('#featureInfoPopupText').removeClass('show');
        $('#featureInfoPopup').zIndex(-1);  
    }); 

    // on chrome, map.on(click, fn...)
    // on firefox, map.getViewport().addEventListener('click')
    map.getViewport().addEventListener('click', function (e) {
        e.preventDefault();
        $('#featureInfoPopupText').removeClass('show');
        $('#featureInfoPopup').zIndex(-1);  
        $('#layerInfoPopupText').removeClass('show');
        $('#layerInfoPopup').zIndex(-1);  

        var featureLayer = map.forEachFeatureAtPixel(map.getEventPixel(e),
            function (feature, layer) {
                if(layer && feature && layer.get('selectable')) 
                {
                    console.log('layer is selectable');
                    return [feature, layer];
                }
                console.log('layer is not selectable');
        });

        if (featureLayer != undefined && featureLayer[0] != undefined) {
            globals.selectedFeature = featureLayer[0];
            globals.selectedFeatureID = featureLayer[0].getProperties()['id'];
            // wfs/wms/other layers
            if(globals.selectedFeatureID == undefined || globals.shapes[globals.selectedFeatureID] == undefined){
                var layerName = featureLayer[1].get('name');
                (<ol.Feature>featureLayer[0]).setProperties({'layer': layerName});
                while(globals.shapes[layerName + globals.counts[layerName]] != null) {
                    globals.counts[layerName]++;
                }                
                globals.selectedFeatureID =  layerName + globals.counts[layerName]++;
                (<ol.Feature>featureLayer[0]).setProperties({'id': globals.selectedFeatureID});
                featureInfoPopup();
            // shape layer
            } else {
                layerInfoPopup();
            }
        }
    });
}

// validate input values for layerInfoReq
function validateLayerInfo(layerInfoReq) {
    // check for regex matches
    var check = false;
    var value = (<HTMLInputElement>document.getElementById(layerInfoReq.val)).value;
    if(value != undefined) 
        check =  matchRegex(new RegExp(layerInfoReq.regex), value.trim());

    // correct 
    if(check) {
        (<HTMLInputElement>document.getElementById(layerInfoReq.val)).classList.remove('wrong')
        document.getElementById(layerInfoReq.val + '-msg').innerHTML='';
    // incorrect and not marked as wrong
    } else if(!(<HTMLInputElement>document.getElementById(layerInfoReq.val)).classList.contains('wrong')) {
        (<HTMLInputElement>document.getElementById(layerInfoReq.val)).classList.add('wrong');
        document.getElementById(layerInfoReq.val+'-msg').className = 'msg';
        document.getElementById(layerInfoReq.val + '-msg').innerHTML='correct syntax is <br/> '
                + '<b>Regex:</b> ' + layerInfoReq.regex + '<br/>' 
                + '<b>Example:</b> ' + layerInfoReq.example;        
    } 
}

// sets up featureInfo popup
function featureInfoSetup() {
    var app = document.getElementById('app');
    var featureInfoDiv = windowSetup('featureInfo', 'Feature Information');
    app.appendChild(featureInfoDiv);

    var featureInfoContents = document.getElementById('featureInfo-contents');
    var fields = document.createElement('div');
    fields.id = 'featureInfoFields';
    featureInfoContents.appendChild(fields);

    // click on edit button to bring up layerinfo popup
    var editButton = document.createElement('button');
    editButton.innerHTML = "EDIT";
    editButton.onclick = layerInfoPopup;
    featureInfoContents.appendChild(editButton);
}

// displays and fills out featureInfo popup
function featureInfoPopup() {
    $('#featureInfoPopupText').addClass('show');
    $('#featureInfoPopup').zIndex(2);    
    document.getElementById('featureInfoFields').innerHTML = ''; // clear off inside

    var properties = globals.selectedFeature.getProperties();
    for(var p in properties) {
        var featurediv = document.createElement('div');
        document.getElementById('featureInfoFields').appendChild(featurediv);

        var featurelabel = document.createElement('span');
        featurelabel.innerHTML = p + ':';
        featurediv.appendChild(featurelabel);

        var featureval = document.createElement('input');
        featureval.type = 'text';
        featureval.disabled = true;
        featureval.value = properties[p];
        featurediv.appendChild(featureval);
    }    
}
