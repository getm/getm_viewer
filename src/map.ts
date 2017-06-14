import './css/map.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import {setupShapes} from './getm';

var attribution = new ol.control.Attribution();
const wfsLayersGroup = new ol.layer.Group();
const shapeLayersGroup = new ol.layer.Group();
const mapLayers = {};
const wfsLayers = {};
export var shapeLayer;
export const map = new ol.Map({
    target: 'map',
    controls: new ol.Collection([new ol.control.FullScreen(), attribution, new ol.control.Zoom()]),
    view: new ol.View({
        projection: 'EPSG:4326',
        center: [0, 0],
        zoom: 3
    }),
    logo: false
});

function populateBaseMapLayers() {
    for (var i in baseMapConfigs) {
        if(baseMapConfigs[i].arcgis_wmts == true) {
            var projection = ol.proj.get(baseMapConfigs[i].srs);
            var projectionExtent = projection.getExtent();
            var size = ol.extent.getWidth(projectionExtent) / baseMapConfigs[i].tilesize;
            var levels = baseMapConfigs[i].levels;
            var resolutions = new Array(levels);   
            var matrixIds = new Array(levels);
            for (var j = 0; j < levels; ++j) {
                resolutions[j] = size / Math.pow(2, j);
                matrixIds[j] = j;
            }

            mapLayers[baseMapConfigs[i].title] = new ol.layer.Tile({
                visible: true,
                preload: 2,
                source: new ol.source.WMTS({
                    url: baseMapConfigs[i].url,
                    format: 'image/jpeg',
                    matrixSet: baseMapConfigs[i].srs,
                    projection: projection,
                    tileGrid: new ol.tilegrid.WMTS({
                        origin: ol.extent.getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds
                    }),
                    style: 'default',
                    wrapX: true,
                    requestEncoding: 'REST',
                    layer: baseMapConfigs[i].layer
                })
            })
        } else {
            mapLayers[baseMapConfigs[i].title] = new ol.layer.Tile({
                visible: true,
                preload: 2,
                source: new ol.source.TileWMS({
                    url: baseMapConfigs[i].url,
                    params: {
                        LAYERS: baseMapConfigs[i].layer,
                        VERSION: baseMapConfigs[i].version,
                        FORMAT: 'image/jpeg',
                        SRS: 'EPSG:4326'
                    },
                    projection: 'EPSG:4326'
                })
            })
        }
    }
}

function populateWFSLayers(){
    for(var i in wfsMapConfigs) {
        wfsLayers['wfs_' + wfsMapConfigs[i].name + '_layer'] = new ol.layer.Vector({
            source: new ol.source.Vector({
                format: (wfsMapConfigs[i].format == 'GML3') ? new ol.format.GML3() : 
                        (wfsMapConfigs[i].format == 'GML2') ? new ol.format.GML2() : null, // TODO: fix this later
                url: wfsMapConfigs[i].hostAddress + wfsMapConfigs[i].url + '&outputFormat=' + wfsMapConfigs[i].format,
                strategy: ol.loadingstrategy.bbox,
                attributions: [new ol.Attribution({
                    html: '<div style="color:' + wfsMapConfigs[i].color + '" class="wfs_legend">' + wfsMapConfigs[i].title + '</div>' //id="' + wfsMapConfigs[i].name + '_attributions' + '"
                })],
            }),
            visible: false,
            style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: wfsMapConfigs[i].color,
                        width: 2
                    })
                }),        
            //
        });
        wfsLayersGroup.getLayers().insertAt(wfsLayersGroup.getKeys().length, wfsLayers['wfs_' + wfsMapConfigs[i].name + '_layer']);
        $('#' + wfsMapConfigs[i].name +'_checkbox').click(function(){
            wfsLayers['wfs_' +  this.id.replace('_checkbox', '_layer')].setVisible(this.checked);
        });  
    }
}

function populateMap() {
    populateBaseMapLayers();
    populateWFSLayers();    

    var mapLayerOptions = Object.keys(mapLayers);   
    var currMapLayer = mapLayerOptions[0]; 
    var mapLayerSelect = document.getElementsByClassName('layer-select');
    var mapSelect = document.createElement('select');
    for( var i = 0; i < mapLayerOptions.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML=mapLayerOptions[i];
        opt.value = mapLayerOptions[i];
        mapSelect.appendChild(opt);
    }
    mapSelect.value = currMapLayer;

    for(var i = 0; i < mapLayerSelect.length; i++) {
        mapLayerSelect[i].innerHTML = ""; // clear contents
        var cln = mapSelect.cloneNode(true);
        (<HTMLSelectElement>cln).onchange = function(){
            currMapLayer = (<HTMLSelectElement>this).value; 
            map.getLayerGroup().getLayers().setAt(0, mapLayers[(<HTMLSelectElement>this).value]);
        };
        mapLayerSelect[i].appendChild(cln);
    }
}

function populateShape(){
    shapeLayerOptions.push('all');
    // generate the sources and layers for the shapes
    for(var i = 0; i < shapeLayerOptions.length; i++) {
        var source = new ol.source.Vector({});
        var vector = new ol.layer.Vector({
            source: source, 
            visible: false, 
            style:  new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,0,0,1)'
                }),
                fill:new ol.style.Fill({
                    color: 'rgba(255,255,255,0.4)'
                })
            })
        });
        vector.set('selectable', true);
        vector.set('name', shapeLayerOptions[i]);
        shapeLayersGroup.getLayers().insertAt(i, vector);
    }

    shapeLayer = shapeLayersGroup.getLayers().item(0);
    shapeLayer.setVisible(true);
    var shapeLayerSelect = document.getElementsByClassName('shape-layer-select');

    // make all options change at the same time
    var $set = $('.shape-layer-select');
    $set.change(function(){
        $set.not(this).val(this.value);
    });    

    for (var i = 0; i < shapeLayerSelect.length; i++) {
        for( var j = 0; j < shapeLayerOptions.length; j++) {
            var opt = document.createElement('option');
            opt.innerHTML=shapeLayerOptions[j];
            opt.value = shapeLayerOptions[j];

            // TODO: make this less hacky >__>
            if(shapeLayerSelect[i].id == 'layerinfolayer' && j == shapeLayerOptions.length -1) 
                continue;

            shapeLayerSelect[i].appendChild(opt.cloneNode(true));
        }
        (<HTMLSelectElement>shapeLayerSelect[i]).value = shapeLayer.get('name');
        (<HTMLSelectElement>shapeLayerSelect[i]).onchange = function(){
            // set other layers false and set this layer true, unless option is all, which case all true
            if((<HTMLSelectElement>this).selectedIndex < (<HTMLSelectElement>this).length -1) {
                shapeLayer = shapeLayersGroup.getLayers().item((<HTMLSelectElement>this).selectedIndex);
                for(var j = 0; j < (<HTMLSelectElement>this).length - 1; j++ ){
                    shapeLayersGroup.getLayers().item(j).setVisible(false);
                }
                shapeLayersGroup.getLayers().item((<HTMLSelectElement>this).selectedIndex).setVisible(true);                
            } else  {
                shapeLayer = shapeLayersGroup.getLayers().item(0);; // all is set to default value
                for(var j = 0; j < (<HTMLSelectElement>this).length - 1; j++ ){
                    shapeLayersGroup.getLayers().item(j).setVisible(true);
                }
            }
            setupShapes();     
        };        
    }
}

export function setupMap() {
    map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize());
    $('#legend').click(function(){
        attribution.setCollapsed(!attribution.getCollapsed());
    });

    populateMap();
    populateShape();

    map.setLayerGroup(new ol.layer.Group({
        layers: [
            mapLayers[Object.keys(mapLayers)[0]], // basemap 
            wfsLayersGroup, // wfs layers
            shapeLayersGroup // shape layers
        ]
    }));
}