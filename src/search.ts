import {globals, windowSetup} from './globals';
import {map} from './map';
import {layerInfoPopup} from './layerinfo'; // to something about this?

var catsearchResultsDiv;
var besearchResultsDiv;
var SHAPES_LAYER = 2;
const WILDCARD = '*';

// sets up catsearch result window
export function catsearchResultsSetup() {
    catsearchResultsDiv = new windowSetup('catsearchResults', 'CATCODE Results');

    var catsearchResults = document.createElement('div');
    catsearchResultsDiv.windowContents.appendChild(catsearchResults);
    document.getElementById('catsearchBtn').onclick = function() {
        $(catsearchResultsDiv.popupText).addClass('show');
        $(catsearchResultsDiv.popup).zIndex(2);     
        catsearch();    
    }
}

// catcode searches within extent -- searches only for shapes :(
function catsearch() {
    var extent = map.getView().calculateExtent(map.getSize());
    catsearchResultsDiv.windowContents.innerHTML = "";
    (<ol.layer.Group>(map.getLayerGroup().getLayers().getArray()[SHAPES_LAYER])).getLayers().getArray().forEach(function(layer){
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
                    catsearchResultsDiv.windowContents.appendChild(result);
                }
            }            
        })
    });
}

// sets up besearch result window
export function besearchResultsSetup() {
    besearchResultsDiv = new windowSetup('besearchResults', 'BE Results');

    var besearchResults = document.createElement('div');
    besearchResultsDiv.windowContents.appendChild(besearchResults);
    document.getElementById('besearchBtn').onclick = function(){
        $(besearchResultsDiv.popupText).addClass('show');
        $(besearchResultsDiv.popup).zIndex(2);     
        besearch();      
    }
}

// perform be search
function besearch(){
    var results = [];
    besearchResultsDiv.windowContents.innerHTML = "";
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
                besearchResultsDiv.windowContents.appendChild(result);
            }
        }
    }
}
