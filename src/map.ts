import './css/map.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import {setupShapes} from './getm';
import {globals} from './globals';

// layer defaults if not specified in configs
const defaultVersion = '1.1.0';
const defaultStyleStroke = 'rgba(0,0,0,1)';
const defaultStyleFill = 'rgba(0,0,0,0)';

var attribution = new ol.control.Attribution();
const layerGroups = [];
var BASEMAP_LAYER = 0; // index of basemap layer in map.getLayerInfoGroup();
var WFS_LAYER = 1; // index of wfs layer in map.getLayerGroup()
var SHAPE_LAYER = 2; // index of shape layer in map.getLayerGroup()
declare const CGSWeb_Map; // Config object
export const map = new ol.Map({ 
    target: 'map',
    controls: new ol.Collection([new ol.control.FullScreen(), attribution,new ol.control.Zoom()]),
    view: new ol.View({
        projection: ol.proj.get(CGSWeb_Map.Options.map.defaultProjection),
        center: CGSWeb_Map.Options.map.defaultCenter,
        zoom: CGSWeb_Map.Options.map.defaultZoom
    }),
    logo: false
});

// populates the base map layer and sets up controls to switch between basemaps
function populateBaseMapLayers() {
    var layers = [];
    CGSWeb_Map.Options.layers.baseMapConfigs.forEach(function(baseMapConfig){
        // create layer for each baseMapConfig: either wmts or wms
        var layer; 
        if(baseMapConfig.arcgis_wmts == true) { // wmts
            var projection = ol.proj.get(baseMapConfig.srs);
            var projectionExtent = projection.getExtent();
            var size = (ol.extent.getWidth(projectionExtent) / baseMapConfig.tilesize);
            var levels = baseMapConfig.levels;
            var resolutions = new Array(levels);   
            var matrixIds = new Array(levels);
            for (var j = 0; j < levels; ++j) {
                resolutions[j] = size / Math.pow(2, j);
                matrixIds[j] = j;
            }
            layer = new ol.layer.Tile({
                visible: true,
                preload:2,
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
                    layer: baseMapConfig.layer,
                    crossOrigin: 'anonymous'
                })
            });
        } else { // wms
            layer = new ol.layer.Tile({
                visible: true,
                preload: 2,
                source: new ol.source.TileWMS({
                    url: baseMapConfig.url,
                    params: {
                        LAYERS: baseMapConfig.layer,
                        VERSION: baseMapConfig.version,
                        FORMAT: 'image/jpeg',
                        SRS: CGSWeb_Map.Options.map.defaultProjection
                    },
                    projection: CGSWeb_Map.Options.map.defaultProjection,
                    crossOrigin: 'anonymous'
                }),
            });
        }
        layers.push(layer);

        // swap the basemap layer being used
        $('#' + baseMapConfig.title.replace(/\W/g, '') +'_checkbox').change(function(){
            map.getLayerGroup().getLayers().getArray()[BASEMAP_LAYER] = layer; 
            map.updateSize();
        });         
    });

    // default basemap is index 0
    layerGroups.push(layers[0]); 
    $('#' + CGSWeb_Map.Options.layers.baseMapConfigs[0].title.replace(/\W/g, '') +'_checkbox').click();
}

// set the extent to max [-180, -90, 180, 90] and deals with wrap arounds
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
            [extent[0], extent[1], 180, extent[3]],
            [-180, extent[1], -180 + (extent[2] - 180), extent[3]],
        ];
    } else if(extent[0] < -180) {
        // Wrap to the west.
        return [
            [-180, extent[1], extent[2], extent[3]],
            [extent[1], 180 + (extent[0] + 180), extent[3], 180],
        ];
    } else {
        return [extent[0], extent[1], extent[2], extent[3]];
    }
}

// lonLat vs latLon
function flipExtent(extent, oldVersion, newVersion){
    extent = normalizeExtent(extent);
    var temp;
    if(oldVersion.trim() != newVersion.trim()){
        if(extent.length == 4) {
            temp = extent[0];
            extent[0] = extent[1];
            extent[1] = temp;
            temp = extent[2];
            extent[2] = extent[3];
            extent[3] = temp;
        } else if (extent.length == 2) {
            extent.forEach(function (ex){
                temp = ex[0];
                ex[0] = ex[1];
                ex[1] = temp;
                temp = ex[2];
                ex[2] = ex[3];
                ex[3] = temp;
            });
        }
    }
    return extent;
}

// populates non-basemap and non-wfs layers -- TODO: keep track of which layer shapes is in
function populateLayers(){
    Object.keys(CGSWeb_Map.Options.layers).forEach(function(key){
        var layerConfigs = CGSWeb_Map.Options.layers[key];
        var layers = [];
        if(key  != 'baseMapConfigs' && key != 'wfsMapConfigs') {
            layerConfigs.forEach(function(layerConfig){
                var layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        format: (layerConfig.version == '1.1.0') ? new ol.format.GML3() : 
                                (layerConfig.version == '1.0.0') ? new ol.format.GML2() : 
                                undefined,
                        url: layerConfig.url ? function(extent,resolution,proj) {
                            return layerConfig.hostAddress + layerConfig.url 
                                + '&version=' + (layerConfig.version ? layerConfig.version : defaultVersion)
                                + '&srs=' + (layerConfig.srs ? layerConfig.srs : CGSWeb_Map.Options.map.defaultProjection)
                                + '&bbox=' + flipExtent(
                                    extent, 
                                    '1.3.0',
                                    (layerConfig.version ? layerConfig.version : defaultVersion)).join(',') ;
                        }: undefined,
                        strategy: ol.loadingstrategy.bbox,
                        attributions: [new ol.Attribution({
                            html: '<div style="color:' + getStyleColor(layerConfig) + ';" class="wfs_legend">' + layerConfig.title + '</div>',
                            
                        })]  
                    }),
                    updateWhileInteracting: true,
                    visible: false,
                    style: layerConfig.style ? 
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: getStyleColor(layerConfig, 'stroke'),
                                width: getStyleWidth(layerConfig)
                            }),
                            fill: new ol.style.Fill({
                                color: getStyleColor(layerConfig, 'fill')
                            })
                        }): 
                        new ol.style.Style()      
                });
    
                // allows layers to be selected
                layer.set('name', layerConfig.name);
                layer.set('selectable', true);
                layers.push(layer);
                globals.counts[layerConfig.name] = 0;
            });

            layerGroups.push(
                new ol.layer.Group({
                layers: layers
            }));                 
        }
    });
}

// populates each of the individual layers to be placed on map
function populateMap() {
    populateBaseMapLayers();
    populateWFS();
    populateLayers();
    populateShape(); 
}

function rgb2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function createSLD(wfsMapConfig){
    return '<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" '
    + 'xmlns:ogc="http://www.opengis.net/ogc" ' 
    + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' 
    + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" ' 
    + 'xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">'
        + '<NamedLayer>' 
        + '<Name>' + wfsMapConfig.wms.layers + '</Name>' 
            + '<UserStyle>'
                + '<Title>SLD Cook Book: Simple Line</Title>' 
                + '<FeatureTypeStyle><Rule><LineSymbolizer><Stroke>'
                    + '<CssParameter name="stroke">' + rgb2hex(getStyleColor(wfsMapConfig, 'stroke')) + '</CssParameter>'
                    + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                + '</Stroke></LineSymbolizer></Rule></FeatureTypeStyle>'
            + '</UserStyle>'
        + '</NamedLayer>'
    + '</StyledLayerDescriptor>';
}


function getStyleColor(layerConfig, style='unspecified') {
    if(layerConfig.style) {
        switch(style) {
            case 'unspecified':
            case 'stroke': 
                if(layerConfig.style.stroke)
                    return layerConfig.style.stroke.color ? layerConfig.style.stroke.color : defaultStyleStroke;
            case 'fill':
                if(layerConfig.style.fill)
                    return layerConfig.style.fill.color ? layerConfig.style.fill.color : defaultStyleFill;
                return defaultStyleFill;
        }
    }
    return defaultStyleStroke;
}

function getStyleWidth(layerConfig) {
    if(layerConfig.style && layerConfig.style.stroke) {
        return layerConfig.style.stroke.width ? layerConfig.style.stroke.width : 3;
    }
    return 3;
}

// populates WFS layers 
function populateWFS() {
    var wfslayers = [];
    var wmslayers = [];
    CGSWeb_Map.Options.layers.wfsMapConfigs.forEach(function(wfsMapConfig){
        // wfs required
        if(wfsMapConfig.wfs != undefined && wfsMapConfig.wfs != {}) {
            var wfslayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: (wfsMapConfig.wfs.version == '1.1.0') ? new ol.format.GML3() : 
                            (wfsMapConfig.wfs.version == '1.0.0') ? new ol.format.GML2() : 
                            undefined,
                    url: wfsMapConfig.wfs.url ? function(extent,resolution,proj) {
                        return wfsMapConfig.wfs.hostAddress + wfsMapConfig.wfs.url 
                            + '&version=' + (wfsMapConfig.wfs.version ? wfsMapConfig.wfs.version : defaultVersion)
                            + '&srs=' + (wfsMapConfig.wfs.srs ? wfsMapConfig.wfs.srs : CGSWeb_Map.Options.map.defaultProjection)
                            + '&bbox=' + flipExtent(
                                extent, 
                                '1.3.0',
                                (wfsMapConfig.wfs.version ? wfsMapConfig.wfs.version : defaultVersion)).join(',') ;
                    }: undefined,
                    strategy: ol.loadingstrategy.bbox,
                    attributions: [new ol.Attribution({
                        html: '<div style="color:' + getStyleColor(wfsMapConfig) + ';" class="wfs_legend">' + wfsMapConfig.title + '</div>',
                        
                    })]  
                }),
                updateWhileInteracting: true,
                visible: false,
                style: wfsMapConfig.style ? 
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: getStyleColor(wfsMapConfig, 'stroke'),
                            width: getStyleWidth(wfsMapConfig)
                        }),
                        fill: new ol.style.Fill({
                            color: getStyleColor(wfsMapConfig, 'fill')
                        }),
                    }): 
                    new ol.style.Style()      
            });
            wfslayer.set('name', wfsMapConfig.wfs.name);
            wfslayer.set('selectable', true);
            wfslayers.push(wfslayer);
            globals.counts[wfsMapConfig.wfs.name] = 0;
            
            // wms optional
            if(wfsMapConfig.wms != undefined && wfsMapConfig.wms != {}) {      
                var wmslayer = new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: wfsMapConfig.wms.hostAddress + wfsMapConfig.wms.url,
                        params: {
                            LAYERS: wfsMapConfig.wms.layers,
                            TILED: true,
                            VERSION: wfsMapConfig.wms.version,
                            SLD_BODY: createSLD(wfsMapConfig)//encodeURI(createSLD())
                        },
                        crossOrigin: 'anonymous',
                        serverType: 'geoserver',
                        projection: CGSWeb_Map.Options.map.defaultProjection,
                        attributions: [new ol.Attribution({
                            html: '<div style="color:' + getStyleColor(wfsMapConfig) + ';" class="wfs_legend">' + wfsMapConfig.title + '</div>',
                            
                        })]  
                    }),
                    visible: false
                }) ;
                wmslayers.push(wmslayer);
            } else { // if wms does not exist, does not display when past zoom threshold
                wmslayers.push(new ol.layer.Vector());
            }

            // checkbox will trigger visibility change
            $('#' + wfsMapConfig.name.replace(/\W/g, '') +'_checkbox').click(function(){
                wfslayer.setVisible(this.checked);
                if(wmslayer) {
                    wmslayer.setVisible(this.checked);
                }
            }); 
        }
    });

    // creates wfs and wms layer groups
    var wfslayerGroup = new ol.layer.Group({
        layers: wfslayers
    });
    var wmslayerGroup = new ol.layer.Group({
        layers: wmslayers
    })
    layerGroups.push(wmslayerGroup);  

    // WMS/WFS change when zoom level passes threshold
    map.getView().on('change:resolution', function(){
        //console.log(map.getView().getZoom());
        if(map.getView().getZoom() > CGSWeb_Map.Options.zoomThreshold) {
            //console.log('wfs')
            map.getLayerGroup().getLayers().getArray()[WFS_LAYER] = wfslayerGroup;
        } else {
            //console.log('wms');
            map.getLayerGroup().getLayers().getArray()[WFS_LAYER] = wmslayerGroup;
        }
    });
}

// sets up the shape layer options
function populateShape(){
    // default global shape layer is index 0
    setGlobalShapeLayer(layerGroups[SHAPE_LAYER].getLayers().item(0));

    // for each shape layer select, populate 
    var shapeLayerSelect = document.getElementsByClassName('shape-layer-select');
    Array.apply(null, {length: shapeLayerSelect.length}).map(Number.call, Number).forEach(function(i){
        CGSWeb_Map.Options.layers.shapesConfigs.forEach(function(shapeConfig){
            // inserts options for each select
            var opt = document.createElement('option');
            opt.innerHTML = shapeConfig.title;
            opt.value = shapeConfig.name;
            shapeLayerSelect[i].appendChild(opt);

            //checkbox will trigger visibility change
            $('#' + shapeConfig.name.replace(/\W/g, '') +'_checkbox').click(function(){
                setGlobalShapeLayer(layerGroups[SHAPE_LAYER].getLayers().item(CGSWeb_Map.Options.layers.shapesConfigs.indexOf(shapeConfig)));        
            });
        });
        // might have to set attribute for older jquery versions
        $('#' + CGSWeb_Map.Options.layers.shapesConfigs[0].name.replace(/\W/g, '') +'_checkbox').prop('checked', true);

        (<HTMLSelectElement>shapeLayerSelect[i]).value = globals.shapeLayer.get('name');
        (<HTMLSelectElement>shapeLayerSelect[i]).onchange = function(){
            $('#' + (<HTMLSelectElement>this).value.replace(/\W/g, '') +'_checkbox').click();
            setGlobalShapeLayer(layerGroups[SHAPE_LAYER].getLayers().item((<HTMLSelectElement>this).selectedIndex));      
        };           
    });
    // make all options change at the same time
    var $set = $('.shape-layer-select');
    $set.change(function(){
        $set.not(this).val(this.value);
    }); 
}

// sets the displayed global shapes layer to be layer input
function setGlobalShapeLayer(layer){
    layerGroups[SHAPE_LAYER].getLayers().getArray().forEach(function(layer){
        layer.setVisible(false);
    });
    globals.shapeLayer = layer;
    globals.shapeLayer.setVisible(true); 
    setupShapes(); // reflect global shape layer change in getm popup
}

export function setupMap() {
    // map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize()); // china lake
    populateMap(); // populate layers of map
    
    // assign the layers to map
    map.setLayerGroup(new ol.layer.Group({
        layers: layerGroups
    }));

    // key for layers displayed -- not including basemap
    $('#legend').click(function(){
        attribution.setCollapsed(!attribution.getCollapsed());
    });    

    // sets map to take over large portion of page
    window.onresize = mapResize;
    mapResize();
}

// fixes firefox issue with canvas resizing and coordinate resetting
function mapResize() {
    $('#map').height(window.innerHeight - $('#topBanner').height() - $('#bottomBanner').height() - $('#nav').height() - $('#nav').height());  
    map.updateSize();
}