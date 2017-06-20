import * as $ from 'jquery';
import 'jqueryui';
import './css/getm.css';
import * as ol from 'openlayers';
import '../dist/config.js';
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
            var feature = new ol.format.KML().readFeature(storageShapes[shapesID]['feature']);
            for(var l of (<ol.layer.Group>map.getLayerGroup().getLayers().getArray()[2]).getLayers().getArray()){         
                if( (<ol.layer.Vector>l).get('name') == storageShapes[shapesID]['layer']){
                    layer = l;
                }
            }
            (<ol.layer.Vector>layer).getSource().addFeature(feature);    
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

function besearch(){
    var results = [];
    document.getElementById('besearchResults').innerHTML = "";
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
                document.getElementById('besearchResults').appendChild(result);
            }
        }
    }
}

function normalizeExtent(extent) {
    // Check if total Lon > 360.
    if(extent[0] > 0 && extent[2] > 0 && extent[2] - extent[0] > 360) {
        // Entire extent east of 0.
        extent[0] = -180;
        extent[2] = 180;
    } else if(extent[0] < 0 && extent[2] < 0 && Math.abs(extent[0]) - Math.abs(extent[2]) > 360) {
        // Entire extent west of 0.
        extent[0] = -180;
        extent[2] = 180;
    } else if(extent[0] < 0 && extent[2] > 0 && Math.abs(extent[0]) + Math.abs(extent[2]) > 360) {
        // Extent contains 0.
        extent[0] = -180;
        extent[2] = 180;
    }

    // Check if total Lat > 180.
    if(extent[1] > 0 && extent[3] > 0 && extent[3] - extent[1] > 180) {
        // Entire extent north of 0.
        extent[1] = -90;
        extent[3] = 90;
    } else if(extent[1] < 0 && extent[3] < 0 && Math.abs(extent[1]) - Math.abs(extent[3]) > 180) {
        // Entire extent south of 0.
        extent[1] = -90;
        extent[3] = 90;
    } else if(extent[1] < 0 && extent[3] > 0 && Math.abs(extent[1]) + Math.abs(extent[3]) > 180) {
        // Extent contains 0.
        extent[1] = -90;
        extent[3] = 90;
    }

    // Shift lon to range (-360, 360).
    var max = Math.max(Math.abs(extent[0]), Math.abs(extent[2]));
    var revs = Math.floor(max / 360);
    if(extent[0] > 0 && extent[2] > 0) {
        extent[0] = extent[0] - revs*360;
        extent[2] = extent[2] - revs*360;
    } else if(extent[0] < 0 && extent[2] < 0) {
        extent[0] = extent[0] + revs*360;
        extent[2] = extent[2] + revs*360;
    }

    if(extent[2] > 180) {
        // Wrap to the east.
        return [
            [extent[1], extent[0], extent[3], 180],
            [extent[1], -180, extent[3], -180 + (extent[2] - 180)],
        ];
    } else if(extent[0] < -180) {
        // Wrap to the west.
        return [
            [extent[1], -180,extent[3], extent[2]],
            [extent[1], 180 + (extent[0] + 180), extent[3], 180],
        ];
    } else {
        return [extent[1], extent[0], extent[3], extent[2]];
    }
}

// catcode searches within range
function catsearch() {
    var extent = map.getView().calculateExtent(map.getSize());
    document.getElementById('catsearchResults').innerHTML = "";
    (<ol.layer.Group>(map.getLayerGroup().getLayers().getArray()[2])).getLayers().getArray().forEach(function(layer){
        (<ol.layer.Vector>layer).getSource().getFeaturesInExtent(extent).forEach(function(feature){
            if($('#catsearch').val()){
                if($('#catsearch').val() == WILDCARD ||
                    (globals.shapes[feature.get('id')].getProperty('catcode') == $('#catsearch').val())) {
                        //results.push(feature.get('id'));
                        var result = document.createElement('div');
                        result.innerHTML = feature.get('id');
                        result.onclick = function(){
                            globals.selectedFeatureID = this.innerHTML;
                            layerInfoPopup();
                        }
                        document.getElementById('catsearchResults').appendChild(result);

                }
            }            
        })
    });
}

export function setup() {
    catsearchFiltersSetup();
    besearchFiltersSetup();
    getmSetup();
    wfsSetup();
    mapLayerSetup();

    // TODO: dynamically add to nav bar and do the clicky stuff
    $('#saveBtn').click(saveShapes);
    $('#saveSessBtn').click(saveSession);
    $('#loadSessBtn').click(loadSession);   
    $('#printBtn').click(printImg);
}

function printImg(e) {
    // var css = '<link rel="stylesheet" href="map.bundle.css" type="text/css" media="all">';
    // var js = '    <script src="ol.js"></script>' +
    // '<script src="config.js"></script>' +
    // '<script src="map.bundle.js"></script>' +
    // '<script src="bootstrap.min.js"></script>';
    //window.print();
    var canvas = <HTMLCanvasElement>document.getElementById("map").getElementsByClassName("ol-unselectable")[0];
    // canvas
    // canvas.webkitRequestFullScreen();
    // canvas.requestFullscreen();
    // canvas.webkitRequestFullscreen();
    // document.getElementById("map").webkitRequestFullScreen();
    // console.log(document.webkitFullscreenElement);
    
    // document.exitFullscreen()
    // document.webkitExitFullscreen();
    // document.webkitCancelFullScreen();

    // var printContents = document.getElementById("map").innerHTML + js;
    // var originalContents = document.body.innerHTML;
    // document.body.innerHTML = printContents;
    // window.print();
    // document.body.innerHTML = originalContents;
    


    //document.getElementById("map").webkitRequestFullScreen();
    window.createImageBitmap(canvas).then(result =>drawBitmap(result) );
    

    // e.preventDefault();
    // var canvas = document.getElementById("map").getElementsByClassName("ol-unselectable")[0];
    // var img = (canvas as any).toDataURL('image/png');
    // var popup = window.open();
    // popup.document.write('<img src="'+img+'"/>');
    // popup.focus(); //required for IE 
    // $(popup).ready(function(){
    //     popup.window.print();
    //     popup.close();
    // });
}
function drawBitmap(result: ImageBitmap){

    // var i = new Image(2000,2000);
    // i.
    var popup = window.open();
    var canvas2 = popup.document.createElement('canvas');
    canvas2.width = 2000;
    canvas2.height = 800;    
    var ctx = canvas2.getContext('2d');
    ctx.drawImage(result, 0, 0);
    // var x = canvas2.toDataURL('image/png');    
    popup.focus(); //required for IE 
    $(popup).ready(function(){
        popup.window.print();
        popup.close();
    });


    // var canvas2 = document.createElement('canvas');
    // canvas2.width = 2000;
    // canvas2.height = 800;
    // document.getElementById('app').appendChild(canvas2);
    // var ctx = canvas2.getContext('2d');
    // ctx.drawImage(result, 0, 0);
    // var x = canvas2.toDataURL('image/png');
    // var img = new Image();
    // img.src = 'data:image/bmp,' + result;
    // img.
    // document.getElementById('app').appendChild(img);
}

function wfsSetup() {
    var wfsPopup = windowSetup('wfs', 'WFS');
    document.getElementById('app').appendChild(wfsPopup);
    var windowContents = document.getElementById('wfs-contents');
    CGSWeb_Map.Options.layers.wfsMapConfigs.forEach(function(wfsMapConfig){
        var div = document.createElement('div');
        windowContents.appendChild(div);

        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = wfsMapConfig.name.trim() + '_checkbox';
        div.appendChild(input);

        var label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.innerHTML = wfsMapConfig.title;
        div.appendChild(label);
    });

    document.getElementById('wfsButton').onclick = function() {
        if(document.getElementById("wfsPopupText").classList.toggle("show")) {
            $("#wfsPopup").zIndex(2);
        }        
    }    
}

function catsearchFiltersSetup() {
    var catsearchFilterPopup = windowSetup('catsearchFilter', 'Cat Search');
    document.getElementById('app').appendChild(catsearchFilterPopup);

    var windowContents = document.getElementById('catsearchFilter-contents');
    var catSearchfilter = document.createElement('div');
    windowContents.appendChild(catSearchfilter);

    var catSearchLabel = document.createElement('span'); 
    catSearchLabel.innerHTML = 'Catcode Search: ';
    catSearchfilter.appendChild(catSearchLabel);

    var catSearchInput = document.createElement('input');
    catSearchInput.type = 'search';
    catSearchInput.id = 'catsearch';
    catSearchfilter.appendChild(catSearchInput);

    var catsearchfilter = document.createElement('div');
    windowContents.appendChild(catsearchfilter);

    var catfilterSearchBtn = document.createElement('input');
    catfilterSearchBtn.type = 'button';
    catfilterSearchBtn.value = 'Search';
    catfilterSearchBtn.id = 'catfilterSearchBtn';
    catfilterSearchBtn.onclick = catsearch;
    catsearchfilter.appendChild(catfilterSearchBtn);

    var catsearchResults = document.createElement('div');
    catsearchResults.className = 'window-contents';
    catsearchResults.id = 'catsearchResults';
    document.getElementById('catsearchFilterPopupText').appendChild(catsearchResults);
    document.getElementById('catsearchBtn').onclick = function() {
        if(document.getElementById("catsearchFilterPopupText").classList.toggle("show")) {
            $("#catsearchFilterPopup").zIndex(2);
        }        
    }
}

function besearchFiltersSetup() {
    var besearchFilterPopup = windowSetup('besearchFilter', 'BE Search');
    document.getElementById('app').appendChild(besearchFilterPopup);

    var windowContents = document.getElementById('besearchFilter-contents');
    var beSearchfilter = document.createElement('div');
    windowContents.appendChild(beSearchfilter);

    var beSearchLabel = document.createElement('span'); 
    beSearchLabel.innerHTML = 'BE Search: ';
    beSearchfilter.appendChild(beSearchLabel);

    var beSearchInput = document.createElement('input');
    beSearchInput.type = 'search';
    beSearchInput.id = 'besearch';
    beSearchfilter.appendChild(beSearchInput);

    var besearchfilter = document.createElement('div');
    windowContents.appendChild(besearchfilter);

    var befilterSearchBtn = document.createElement('input');
    befilterSearchBtn.type = 'button';
    befilterSearchBtn.value = 'Search';
    befilterSearchBtn.id = 'befilterSearchBtn';
    befilterSearchBtn.onclick = besearch;
    besearchfilter.appendChild(befilterSearchBtn);

    var searchResults = document.createElement('div');
    searchResults.className = 'window-contents';
    searchResults.id = 'besearchResults';
    document.getElementById('besearchFilterPopupText').appendChild(searchResults);
    document.getElementById('besearchBtn').onclick = function(){
        if(document.getElementById("besearchFilterPopupText").classList.toggle("show")) {
            $("#besearchFilterPopup").zIndex(2);
        }
    }
}

function getmSetup() {
    var getm = windowSetup('getm');
    document.getElementById('getmButton').onclick = function(){    
        if(document.getElementById("getmPopupText").classList.toggle("show")) {
            $("#getmPopup").zIndex(2);
        };
    }
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
    var getm = windowSetup('mapLayer', 'Map Layers');
    document.getElementById('mapLayerButton').onclick = function(){
        if(document.getElementById("mapLayerPopupText").classList.toggle("show")) {
            $("#mapLayerPopup").zIndex(2);
        }
    };

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
                globals.selectedFeatureID = this.innerHTML;
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

function deleteShapes() {
     $.ajax({
         type: 'POST',
         url: GeoServerRestInterface.getPostDeleteUrl(),
         data: JSON.stringify(buildDelete()),
         contentType: 'application/json',
         success: updateShapesCallback,
     });
}

function updateShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertUrl(),
        data: JSON.stringify(buildUpdate()),
        contentType: 'application/json',
        success: updateShapesCallback,
    });
}

function insertShapes() {
    $.ajax({
        type: 'POST',
        url: GeoServerRestInterface.getPostInsertUrl(),
        data: JSON.stringify(buildInsert()),
        contentType: 'application/json',
         success: updateShapesCallback,
     });
}