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
        projection: ol.proj.get('EPSG:4326'),
        center: [20, 0],
        zoom: 2
    }),
    logo: false
});

function populateBaseMapLayers() {
    var baseMapConfigs = CGSWeb_Map.Options.baseMapConfigs;
    for (var i in baseMapConfigs) {
        if(baseMapConfigs[i].arcgis_wmts == true) {
            var projection = ol.proj.get(baseMapConfigs[i].srs);
            console.log('projection reads ' + baseMapConfigs[i].srs);
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
            console.log('projection reads EPSG:4326');
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


function populateWFSLayers(){
    wfsMapConfigs.forEach(function(wfsMapConfig){
        wfsLayers['wfs_' + wfsMapConfig.name + '_layer'] = new ol.layer.Vector({
            source: new ol.source.Vector({
                format: (wfsMapConfig.version == '1.1.0') ? new ol.format.GML3() : 
                        (wfsMapConfig.version == '1.0.0') ? new ol.format.GML2() : 
                        (wfsMapConfig.format == 'KML') ? new ol.format.KML() : undefined, // TODO: fix this later
                url: function(extent,resolution,proj) {
                    // var norm = normalizeExtent(extent)[0];
                    // var temp = norm[0];
                    // norm[0] = norm[1];
                    // norm[1] = temp;
                    // temp = norm[2];
                    // norm[2] = norm[3];
                    // norm[3] = temp;
                    return wfsMapConfig.hostAddress + wfsMapConfig.url 
                        // + '&outputFormat=' + wfsMapConfig.format
                        + '&version=' + wfsMapConfig.version
                        + '&srs=EPSG:4326'
                        + '&bbox=' + normalizeExtent(extent).join(',') ;//+ '&srs=EPSG:4326';
                },
                strategy: ol.loadingstrategy.bbox,
                attributions: [new ol.Attribution({
                    html: '<div style="color:' + wfsMapConfig.color + '" class="wfs_legend">' + wfsMapConfig.title + '</div>' //id="' + wfsMapConfigs[i].name + '_attributions' + '"
                })],
            }),
            visible: false,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: wfsMapConfig.color,
                    width: 3
                })
            }),        
        });
        
        wfsLayersGroup.getLayers().insertAt(wfsLayersGroup.getKeys().length, wfsLayers['wfs_' + wfsMapConfig.name + '_layer']);
        $('#' + wfsMapConfig.name +'_checkbox').click(function(){
            wfsLayers['wfs_' +  this.id.replace('_checkbox', '_layer')].setVisible(this.checked);
        });  
    });
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
        var source = new ol.source.Vector();
        var vector = new ol.layer.Vector({
            source: source, 
            visible: false, 
            style:  new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,0,0,1)',
                    width: 3
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
    // map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize());
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