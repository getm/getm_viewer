import './css/layerinfo.css'
import * as $ from 'jquery';
import * as ol from 'openlayers';
import {map} from './map';
import {globals, windowSetup} from './globals';
import {setupShapes} from './getm';
import {Shape} from './Shape'

declare const GeoServerRestInterface;
declare const layerInfoRequirements;
var required;
var featureInfoDiv;
var layerInfoDiv;

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
        $(layerInfoDiv.layerinfolayerwfs).addClass('hide');
        $(layerInfoDiv.layerinfolayer).removeClass('hide');
        layerInfoDiv.layerinfolayer.value = globals.shapes[globals.selectedFeatureID].getLayer().get('name');  
    } else { // wfs layer
        $(layerInfoDiv.layerinfolayer).addClass('hide');
        $(layerInfoDiv.layerinfolayerwfs).removeClass('hide');
        layerInfoDiv.layerinfolayerwfs.value = globals.selectedFeature.getProperties()['layer'];
    }
}

// retrieves target name
function retrieveTgtName(){
    layerInfoDiv['tgt_name'].value =  globals.selectedFeatureID; 
}

// displays and fills out layerInfo popup
export function layerInfoPopup(){
    if(globals.shapes[globals.selectedFeatureID] == undefined || globals.shapes[globals.selectedFeatureID].getProperties() == undefined) {
        clearLayerInfoContents();
        //fillLayerInfoDefaults();
        retrieveValidProperties();
        retrieveTgtName();  
    } else
        retrieveValues();

    // validate information, scroll to top, and display
    layerInfoRequirements.forEach(validateLayerInfo);
    $(layerInfoDiv.windowContents).scrollTop(0);
    layerInfoDiv.show();    
}

// retrieves values from globals.shapes to fill out layerInfo popup
function retrieveValues() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        if(globals.shapes[globals.selectedFeatureID].getProperties()[layerInfoReq.val] != undefined) {
            layerInfoDiv[layerInfoReq.val].value = globals.shapes[globals.selectedFeatureID].getProperties()[layerInfoReq.val]['val'];
        } else {
            layerInfoDiv[layerInfoReq.val].value = "";
        }
    });
    retrieveLayer();
}

// assigns values from feature and layerInfo popup to globals.shapes(shape) or features(wfs/others)
function assignValues() {
    var id = layerInfoDiv['tgt_name'].value;
    var fields = {};
    var entry = {};

    layerInfoRequirements.forEach(function(layerInfoReq){
        if(id != undefined && id.length > 0 ) {
            try {
                validateLayerInfo(layerInfoReq);
                if(layerInfoDiv[layerInfoReq.val].value.length > 0 && !layerInfoDiv[layerInfoReq.val].classList.contains('wrong'))
                    fields[layerInfoReq.val] =  {'val' : layerInfoDiv[layerInfoReq.val].value, 'type': layerInfoReq.type };
            } catch(e) {
                console.log('exception in assigning ' + layerInfoDiv[layerInfoReq.val].value + ' field ' + layerInfoReq.val);
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
            if(layerInfoDiv[layerInfoReq.val].value.length > 0
                && !layerInfoDiv[layerInfoReq.val].classList.contains('wrong'))
                properties[layerInfoReq.val] = layerInfoDiv[layerInfoReq.val].value;
        });
        globals.selectedFeature.setProperties(properties);
    }
}

// blank slate with layerInfo popup
function clearLayerInfoContents() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        layerInfoDiv[layerInfoReq.val].value ="";
    });
}

// retrieves valid property from feature to layerInfo popup
function retrieveValidProperties() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        // this is a shape
        if(globals.shapes[globals.selectedFeatureID] != undefined 
        && (globals.shapes[globals.selectedFeatureID].getFeature().getProperties()[layerInfoReq.val] != undefined)
        &&  (globals.shapes[globals.selectedFeatureID].getFeature().getProperties()[layerInfoReq.val].length > 0)) {
            layerInfoDiv[layerInfoReq.val].value = globals.shapes[globals.selectedFeatureID].getFeature().getProperties()[layerInfoReq.val];
        } else if (globals.selectedFeature != undefined 
        // this is wfs
        && globals.selectedFeature.getProperties()['id'] == globals.selectedFeatureID 
        &&  globals.selectedFeature.get(layerInfoReq.val)!= undefined 
        && globals.selectedFeature.get(layerInfoReq.val).lenth > 0) {
            layerInfoDiv[layerInfoReq.val].value = globals.selectedFeature.getProperties()[layerInfoReq.val];
        } else {
            //(<HTMLInputElement>document.getElementById(layerInfoReq.val)).value = "";
        }        
    });    
    retrieveLayer();
}

// fill in default values for layerInfo popup
function fillLayerInfoDefaults() {
    layerInfoRequirements.forEach(function(layerInfoReq){
        layerInfoDiv[layerInfoReq.val].value = layerInfoReq.example;
    });
    retrieveLayer();
    retrieveTgtName();  
    assignValues();
}

// sets up layerInfo popup and feature info popup and assigns functionality to buttons
export function layerInfoSetup(){
    retrieveRequiredFields();
    featureInfoSetup();

    layerInfoDiv = new windowSetup('layerInfo', 'Layer Information');
    var layerInfoContents = layerInfoDiv.windowContents;
    var layerInfoForm = document.createElement('form');
    layerInfoForm.id = 'layerInfoForm';
    layerInfoContents.appendChild(layerInfoForm);

    var div = document.createElement('div');
    layerInfoForm.appendChild(div);

    var shapeLayerSelect = document.createElement('select');
    shapeLayerSelect.className = "shape-layer-select";
    div.appendChild(shapeLayerSelect);
    layerInfoDiv.layerinfolayer = shapeLayerSelect; 

    var wfsLayerInput = document.createElement('input');
    wfsLayerInput.type = "text";
    wfsLayerInput.readOnly = true;
    div.appendChild(wfsLayerInput);
    layerInfoDiv.layerinfolayerwfs = wfsLayerInput;

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
        msglabelcontainer.appendChild(msg);
        layerInfoDiv[layerInfoReq.val] = input;
        // form entry is input
        if(layerInfoReq['options'] == undefined) {
            var input = document.createElement('input');
            input.type = 'text';
            input.placeholder = layerInfoReq.val;
            input.onchange = function(){
                validateLayerInfo(layerInfoReq);
            }
            input.setAttribute('data-toggle', 'tooltip');
            input.setAttribute('title', 'Regex: \n\t' + layerInfoReq.regex + '\n' + 'Example: \n\t' + layerInfoReq.example);            
            div.appendChild(input);
            layerInfoDiv[layerInfoReq.val] = input;
        // form entry is select
        } else {
            var select = document.createElement('select');
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
            select.setAttribute('data-toggle', 'tooltip');
            select.setAttribute('title', 'Regex: \n\t' + layerInfoReq.regex + '\n' + 'Example: \n\t' + layerInfoReq.example);                     
            div.appendChild(select);
            layerInfoDiv[layerInfoReq.val] = select;
        }
        layerInfoDiv[layerInfoReq.val].msg = msg;
        var br = document.createElement('br');
        div.appendChild(br);
    });

    var div2 = document.createElement('div');
    layerInfoForm.appendChild(div2);

    var submit = document.createElement('input');
    submit.type = 'button';
    submit.value = 'Submit';
    submit.className = 'button';
    div2.appendChild(submit);
    $(submit).click(function(){
        assignValues();
    });

    $(layerInfoDiv.close).click(function(){
        featureInfoDiv.hide();
    }); 

    document.onclick = function(e){
        if(contextMenu && ($(contextMenu).is(e.target) || $.contains(contextMenu, <HTMLElement>e.target)))
            return;
        else if(contextMenu && contextMenu.parentElement) {
            contextMenu.parentElement.removeChild(contextMenu);
        }
    }

    function contextMenuSetup(e) {
        var contextmenuoptions = ['a', 'b', 'c', 'd'];
        var contextmenufns = [
            function(){console.log('a'); console.log(map.getEventPixel(e));}, 
            function(){console.log('b')},
            function(){console.log('c')}, 
            function(){console.log('d')}
        ];

        var ul = document.createElement('ul');
        ul.className = 'dropdown-menu show';
        document.getElementById('app').appendChild(ul);

        for(var contextmenuoption in contextmenuoptions) {
            var li = document.createElement('li');
            ul.appendChild(li);

            var a = document.createElement('a');
            a.className = 'test';
            a.tabIndex = -1;
            a.onclick = contextmenufns[contextmenuoption];
            a.href = '#';
            li.appendChild(a);

            var span = document.createElement('span');
            span.innerHTML = contextmenuoptions[contextmenuoption];
            a.appendChild(span);            

            if(contextmenuoption != (contextmenuoptions.length - 1).toString()) {
                var divider = document.createElement('li');
                divider.className = 'divider';
                ul.appendChild(divider);
            }
        }
        return ul;
    }
    var contextMenu;

    // context menu
    map.getViewport().addEventListener('contextmenu', function (e) {
        e.stopPropagation();
        e.preventDefault();

        // move context menu
        if(contextMenu && contextMenu.parentElement) {
            contextMenu.parentElement.removeChild(contextMenu);
            contextMenu = contextMenuSetup(e);
            $(contextMenu).css({
                left: (<MouseEvent>e).clientX,
                top: (<MouseEvent>e).clientY,
                position: 'absolute'
            })
        // create context menu            
        } else {
            contextMenu = contextMenuSetup(e);
            $(contextMenu).css({
                left: (<MouseEvent>e).clientX,
                top: (<MouseEvent>e).clientY,
                position: 'absolute'
            })
        }
    });

    // on chrome, map.on(click, fn...)
    // on firefox, map.getViewport().addEventListener('click')
    map.getViewport().addEventListener('click', function (e) {
        e.preventDefault();
        featureInfoDiv.hide();
        layerInfoDiv.hide();

        var featureLayer = map.forEachFeatureAtPixel(map.getEventPixel(e),
            function (feature, layer) {
                if(layer && feature && layer.get('selectable')) {
                    return [feature, layer];
                }
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
    var value = layerInfoDiv[layerInfoReq.val].value;
    if(value != undefined) 
        check =  matchRegex(new RegExp(layerInfoReq.regex), value.trim());

    // correct 
    if(check) {
        layerInfoDiv[layerInfoReq.val].classList.remove('wrong')
        layerInfoDiv[layerInfoReq.val].msg.innerHTML='';
    // incorrect and not marked as wrong
    } else if(!layerInfoDiv[layerInfoReq.val].classList.contains('wrong')) {
        layerInfoDiv[layerInfoReq.val].classList.add('wrong');
        layerInfoDiv[layerInfoReq.val].msg.innerHTML='correct syntax is <br/> '
                + '<b>Regex:</b> ' + layerInfoReq.regex + '<br/>' 
                + '<b>Example:</b> ' + layerInfoReq.example;        
    } 
}

// sets up featureInfo popup
function featureInfoSetup() {
    featureInfoDiv = new windowSetup('featureInfo', 'Feature Information');

    var featureInfoContents = featureInfoDiv.windowContents;
    $(featureInfoContents).css('height', '400px');
    var fields = document.createElement('div');
    featureInfoContents.appendChild(fields);
    featureInfoDiv.fields = fields;

    // click on edit button to bring up layerinfo popup
    var editButton = document.createElement('button');
    editButton.innerHTML = "Edit";
    editButton.className = 'button';
    $(editButton).css('margin','0 10px')
    editButton.onclick = layerInfoPopup;
    featureInfoContents.appendChild(editButton);

    // click on edit button to bring up layerinfo popup
    var copyButton = document.createElement('button');
    copyButton.innerHTML = "Copy";
    copyButton.className = 'button';
    $(copyButton).css('margin','0 10px')
    copyButton.onclick = copyFeatureInfo;
    featureInfoContents.appendChild(copyButton);    
}

// displays and fills out featureInfo popup
function featureInfoPopup() {
    featureInfoDiv.show();
    featureInfoDiv.fields.innerHTML = ''; // clear off inside

    var properties = globals.selectedFeature.getProperties();
    for(var p in properties) {
        var featurediv = document.createElement('div');
        $(featurediv).css({
            'position': 'relative',
            'width': '500px',
            'display': 'table-row'
        })
        featureInfoDiv.fields.appendChild(featurediv);

        var featurelabel = document.createElement('span');
        featurelabel.innerHTML = p + ':';
        $(featurelabel).css({
            'text-align': 'left',
            'display': 'table-cell',
        });        
        featurediv.appendChild(featurelabel);

        var featureval = document.createElement('input');
        featureval.type = 'text';
        $(featureval).selectable();
        featureval.readOnly = true;
        featureval.value = properties[p];
        $(featureval).css({
            'text-align': 'left',
            'display': 'table-cell',
            'float': 'right',
            'height': 'inherit'
        })        
        featurediv.appendChild(featureval);

        featureInfoDiv.center();
    }    
}

// copies the feature info stuff as a list
function copyFeatureInfo() {
    var properties = globals.selectedFeature.getProperties();
    var str = '';
    for(var p in properties) {
        str = str + p + ': \t' + properties[p] + '\r\n';
    }    

    var $temp = $("<input>");
    $temp.css('white-space', 'pre')
    $("body").append($temp);
    $temp.val(str).select();
    document.execCommand("copy");
    $temp.remove();
}