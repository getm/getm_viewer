import './css/map.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import {setupShapes} from './getm';
import {globals} from './globals';
var attribution = new ol.control.Attribution();

const layerGroups = [];
const wfsLayers = {};
const features = {};

export const map = new ol.Map({
    target: 'map',
    controls: new ol.Collection([new ol.control.FullScreen(), attribution, new ol.control.Zoom()]),
    view: new ol.View({
        projection: ol.proj.get('EPSG:4326'),
        center: [20, 0],
        zoom: 2
    }),
    logo: false
});

function populateBaseMapLayers() {
    var layers = [];
    CGSWeb_Map.Options.layers.baseMapConfigs.forEach(function(baseMapConfig){
        if(baseMapConfig.arcgis_wmts == true) {
            var projection = ol.proj.get(baseMapConfig.srs);
            // console.log('projection reads ' + baseMapConfig.srs);
            var projectionExtent = projection.getExtent();
            var size = ol.extent.getWidth(projectionExtent) / baseMapConfig.tilesize;
            var levels = baseMapConfig.levels;
            var resolutions = new Array(levels);   
            var matrixIds = new Array(levels);
            for (var j = 0; j < levels; ++j) {
                resolutions[j] = size / Math.pow(2, j);
                matrixIds[j] = j;
            }
            layers.push(new ol.layer.Tile({
                visible: true,
                preload: 2,
                source: new ol.source.WMTS({
                    url: baseMapConfig.url,
                    format: 'image/jpeg',
                    matrixSet: baseMapConfig.srs,
                    projection: projection,
                    tileGrid: new ol.tilegrid.WMTS({
                        origin: ol.extent.getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds
                    }),
                    style: 'default',
                    wrapX: true,
                    requestEncoding: 'REST',
                    layer: baseMapConfig.layer
                })
            }));
        } else {
            // console.log('projection reads EPSG:4326');
            layers.push(new ol.layer.Tile({
                visible: true,
                preload: 2,
                source: new ol.source.TileWMS({
                    url: baseMapConfig.url,
                    params: {
                        LAYERS: baseMapConfig.layer,
                        VERSION: baseMapConfig.version,
                        FORMAT: 'image/jpeg',
                        SRS: 'EPSG:4326'
                    },
                    projection: 'EPSG:4326'
                }),
            }));
        }
    });

    var layerGroup = new ol.layer.Group({
        layers: layers
    })
    layerGroups[0] = layerGroup;   

    for(var j = 0; j < layers.length ; j++ ){
        layers[j].setVisible(false);
    }
    layers[0].setVisible(true);      
}

// TODO: fix
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

function populateLayers(){
    Object.keys(CGSWeb_Map.Options.layers).forEach(function(key){
        console.log('foreach option layer ' + key);
        var layerConfigs = CGSWeb_Map.Options.layers[key];
        var layers = [];
        // var features = [];
        if(key  != 'baseMapConfigs') {
            console.log('populating ' + key)
            var id = 0;
            layerConfigs.forEach(function(layerConfig){
                console.log('foreach layerconfig ' + layerConfig.name);
                var layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        format: (layerConfig.version == '1.1.0') ? new ol.format.GML3() : 
                                (layerConfig.version == '1.0.0') ? new ol.format.GML2() : 
                                undefined,
                        // features: features,
                        url: layerConfig.url ? function(extent,resolution,proj) {
                            return layerConfig.hostAddress + layerConfig.url 
                                + (layerConfig.version ? '&version=' + layerConfig.version : '')
                                + '&srs=' + 'EPSG:4326'
                                // + '&bbox=' + normalizeExtent(extent).join(',') ;//+ '&srs=EPSG:4326';
                        }: undefined,
                        strategy: ol.loadingstrategy.bbox,
                        attributions: [new ol.Attribution({
                            html: '<div style="color:' + 
                                (layerConfig.style ? 
                                (layerConfig.style.stroke ? layerConfig.style.stroke.color : 
                                (layerConfig.style.fill ? layerConfig.style.fill.color : 
                                'rgba(0,0,0,1)')): 
                                'rgba(0,0,0,1)') + ';" class="wfs_legend">' + layerConfig.title + '</div>',
                            
                        })]  
                    }),
                    updateWhileInteracting: true,
                    visible: false,
                    style: layerConfig.style ? 
                        new ol.style.Style({
                            stroke: layerConfig.style.stroke ? new ol.style.Stroke({
                                color: layerConfig.style.stroke.color ? layerConfig.style.stroke.color : 'rgba(0,0,0,1)',
                                width: layerConfig.style.stroke.width ? layerConfig.style.stroke.width : 3
                            }) : new ol.style.Stroke(),
                            fill: layerConfig.style.fill ? new ol.style.Fill({
                                color: layerConfig.style.fill.color ? layerConfig.style.fill.color : 'rgba(0,0,0,0)'
                            }) : new ol.style.Fill(),
                        }): 
                        new ol.style.Style()      
                });
                layer.set('name', layerConfig.name);
                globals.counts[layerConfig.name] = 0;
                layer.set('selectable', true);
                $('#' + layerConfig.name.replace(/\W/g, '') +'_checkbox').click(function(){
                    layer.setVisible(this.checked);
                }); 
                layers.push(layer);
            });
        }
        var layerGroup = new ol.layer.Group({
            layers: layers
        })
        layerGroups.push(layerGroup);        
        console.log(layerGroups.length);
    });
}

function populateMap() {
    populateLayers();
    populateShape();
    populateBaseMapLayers();
 
    var currMapLayer = CGSWeb_Map.Options.layers.baseMapConfigs[0].title; 

    var mapLayerSelect = document.getElementsByClassName('layer-select');
    var mapSelect = document.createElement('select');
    CGSWeb_Map.Options.layers.baseMapConfigs.forEach(function(baseMapConfig){
        var opt = document.createElement('option');
        opt.innerHTML = baseMapConfig.title;
        opt.value = baseMapConfig.title;
        mapSelect.appendChild(opt);
    });

                 
    // currMapLayer = layerGroups[0].getLayers().item(0).title;
    mapSelect.value = currMapLayer;
    console.log('currmap layer is ' + currMapLayer);
    for(var i = 0; i < mapLayerSelect.length; i++) {
        // mapLayerSelect[i].innerHTML = ""; // clear contents
        var cln = mapSelect.cloneNode(true);
        (<HTMLSelectElement>cln).onchange = function(){
            for(var j = 0; j < (<HTMLSelectElement>this).length ; j++ ){
                layerGroups[0].getLayers().item(j).setVisible(false);
            }
            layerGroups[0].getLayers().item((<HTMLSelectElement>this).selectedIndex).setVisible(true);                  
            currMapLayer = (<HTMLSelectElement>this).value; 
        };
        mapLayerSelect[i].appendChild(cln);
    }
}

function populateShape(){
    globals.shapeLayer = layerGroups[3].getLayers().item(0);
    globals.shapeLayer.setVisible(true);
    var shapeLayerSelect = document.getElementsByClassName('shape-layer-select');


    for (var i = 0; i < shapeLayerSelect.length; i++) {
        CGSWeb_Map.Options.layers.shapesConfigs.forEach(function(shapeConfig){
            var opt = document.createElement('option');
            opt.innerHTML=shapeConfig.name;
            opt.value = shapeConfig.name;        
            shapeLayerSelect[i].appendChild(opt.cloneNode(true));
        });
   
        (<HTMLSelectElement>shapeLayerSelect[i]).value = globals.shapeLayer.get('name');
        (<HTMLSelectElement>shapeLayerSelect[i]).onchange = function(){
            globals.shapeLayer = layerGroups[3].getLayers().item((<HTMLSelectElement>this).selectedIndex);
            for(var j = 0; j < (<HTMLSelectElement>this).length ; j++ ){
                layerGroups[3].getLayers().item(j).setVisible(false);
            }
            layerGroups[3].getLayers().item((<HTMLSelectElement>this).selectedIndex).setVisible(true);                
            setupShapes();     
        };           
    }
    // make all options change at the same time
    var $set = $('.shape-layer-select');
    $set.change(function(){
        $set.not(this).val(this.value);
    }); 
}

export function setupMap() {
    chinaLake();
    $('#legend').click(function(){
        attribution.setCollapsed(!attribution.getCollapsed());
    });
    populateMap();
    map.setLayerGroup(new ol.layer.Group({
        layers: layerGroups
    }));
    $('#map').height(window.innerHeight - $('#topBanner').height() - $('#bottomBanner').height() - $('#nav').height() - $('#nav').height());
    window.onresize = function() {$('#map').height(window.innerHeight - $('#topBanner').height() - $('#bottomBanner').height() - $('#nav').height() - $('#nav').height());  map.updateSize();};    
}

function chinaLake(){
    map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize());
}