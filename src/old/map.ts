import './css/map.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import {setupShapes} from './getm';
import {globals} from './globals';

// layer defaults if not specified in configs
const defaultVersion = '1.1.0';
const defaultStyleStroke = 'rgba(0,0,0,1)';
const defaultStyleFill = 'rgba(0,0,0,0)';

const layerGroups = [];
declare const CGSWeb_Map; // Config object
declare const Spinner; // Spinner object

export const map = new ol.Map({ 
    target: 'map',
    controls: new ol.Collection([
        new ol.control.FullScreen(),
        new ol.control.Zoom(), 
        new ol.control.ZoomSlider(),
        new ol.control.MousePosition({
            coordinateFormat: getCoordinateFormat(4),
            projection: 'EPSG:4326'
        }),
        new ol.control.ScaleLine({
            units: 'nautical'
        })]),
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
        $('#' + baseMapConfig.title.replace(/\W/g, '') + '_checkbox').change(function(){
            map.getLayerGroup().getLayers().getArray()[0] = layer; 
            map.updateSize();
        });         
    });

    // default basemap is index 0
    layerGroups.push(layers[0]); 
    $('#' + CGSWeb_Map.Options.layers.baseMapConfigs[0].title.replace(/\W/g, '') + '_checkbox').click();
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
                        wrapX: false,
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

// formatting colors from rgb to hexadecimal
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
            + '<UserStyle><FeatureTypeStyle>'
                // + usingSLDToSpecifyShape(wfsMapConfig)
                + usingConfigsToSpecifyShape(wfsMapConfig)
            + '</FeatureTypeStyle></UserStyle>'
        + '</NamedLayer>'
    + '</StyledLayerDescriptor>';
}

function sldPointStyle(wfsMapConfig) {
    return '<Rule>' // point rule
            + '<PointSymbolizer>'
                + '<Graphic>'
                    + '<Mark>'
                        + '<WellKnownName>circle</WellKnownName>'
                        + '<Stroke>' 
                            + '<CssParameter name="stroke">' + '#000000'/*rgb2hex(getStyleColor(wfsMapConfig, 'stroke'))*/ + '</CssParameter>'
                            + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig)*1.5 + '</CssParameter>'
                            + '<CssParameter name="stroke-linecap">round</CssParameter>'
                        + '</Stroke>'
                    + '</Mark>'
                    + '<Size>' + (getStyleWidth(wfsMapConfig) * 2) + '</Size>'
                + '</Graphic>'
            + '</PointSymbolizer>'
            + '<PointSymbolizer>'
                + '<Graphic>'
                    + '<Mark>'
                        + '<WellKnownName>circle</WellKnownName>'
                        + '<Stroke>' 
                            + '<CssParameter name="stroke">' + rgb2hex(getStyleColor(wfsMapConfig, 'stroke')) + '</CssParameter>'
                            + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                            + '<CssParameter name="stroke-dasharray">' + getStyleWidth(wfsMapConfig) + ' ' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                            + '<CssParameter name="stroke-dashoffset">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'       
                        + '</Stroke>'
                    + '</Mark>'
                    + '<Size>' + (getStyleWidth(wfsMapConfig) * 2) + '</Size>'
                + '</Graphic>'
            + '</PointSymbolizer>'
            + '<PointSymbolizer>'
                + '<Graphic>'
                    + '<Mark>'
                        + '<WellKnownName>circle</WellKnownName>'
                        + '<Stroke>'
                            + '<CssParameter name="stroke">' + '#FFFFFF'/*rgb2hex(getStyleColor(wfsMapConfig, 'stroke'))*/ + '</CssParameter>'
                            + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                            + '<CssParameter name="stroke-dasharray">' + getStyleWidth(wfsMapConfig) + ' ' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                        + '</Stroke>'
                        + '<Fill>'
                            + '<CssParameter name="fill">' + rgb2hex(getStyleColor(wfsMapConfig, 'fill')) + '</CssParameter>'
                        + '</Fill>'
                    + '</Mark>'
                    + '<Size>' + (getStyleWidth(wfsMapConfig) * 2) + '</Size>'
                + '</Graphic>'
            + '</PointSymbolizer>'
        + '</Rule>';
}

function sldDashedLineStyle(wfsMapConfig) {
    return '<Rule>' // line rule
            + '<LineSymbolizer>' // black border 
                + '<Stroke>' 
                    + '<CssParameter name="stroke">' + '#000000'/*rgb2hex(getStyleColor(wfsMapConfig, 'stroke'))*/ + '</CssParameter>'
                    + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig)*1.5 + '</CssParameter>'
                    + '<CssParameter name="stroke-linecap">round</CssParameter>'
                + '</Stroke>'
            + '</LineSymbolizer>'
            + '<LineSymbolizer>' // white dashes
                + '<Stroke>'
                    + '<CssParameter name="stroke">' + '#FFFFFF'/*rgb2hex(getStyleColor(wfsMapConfig, 'stroke'))*/ + '</CssParameter>'
                    + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                    + '<CssParameter name="stroke-dasharray">' + getStyleWidth(wfsMapConfig) + ' ' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                + '</Stroke>'
            + '</LineSymbolizer>'
            + '<LineSymbolizer>' // colored dashes
                + '<Stroke>'
                    + '<CssParameter name="stroke">' + rgb2hex(getStyleColor(wfsMapConfig, 'stroke')) + '</CssParameter>'
                    + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                    + '<CssParameter name="stroke-dasharray">' + getStyleWidth(wfsMapConfig) + ' ' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                    + '<CssParameter name="stroke-dashoffset">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                + '</Stroke>'
            + '</LineSymbolizer>'
        + '</Rule>';
}

function sldLineStyle(wfsMapConfig) {
    return '<Rule>' // line rule
            + '<LineSymbolizer>' // black border 
                + '<Stroke>' 
                    + '<CssParameter name="stroke">' + rgb2hex(getStyleColor(wfsMapConfig, 'stroke')) + '</CssParameter>'
                    + '<CssParameter name="stroke-width">' + getStyleWidth(wfsMapConfig) + '</CssParameter>'
                    + '<CssParameter name="stroke-linecap">round</CssParameter>'
                + '</Stroke>'
            + '</LineSymbolizer>'
        + '</Rule>';
}

// Hacky temporary solution for SLD
function usingConfigsToSpecifyShape(wfsMapConfig) {
    //http://docs.geoserver.org/stable/en/user/styling/sld/cookbook/lines.html#dashed-line
    return ((wfsMapConfig.shapeType && wfsMapConfig.shapeType.toUpperCase().indexOf('POINT') != -1)
        ? (sldPointStyle(wfsMapConfig)) //  point rule
        : (wfsMapConfig.style.dashed ? sldDashedLineStyle(wfsMapConfig) : (sldLineStyle(wfsMapConfig)))); //  line rule 
}

// retrieves style color for specified layer from configurations
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

// retrieves style width for specified layer from configurations
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
    CGSWeb_Map.Options.layers.wfsMapConfigs.forEach(function(wfsMapConfig) {
        // wfs required
        var wfsloader;
        var wmsloader;
        if(wfsMapConfig.wfs != undefined && wfsMapConfig.wfs != {}) {
            wfsloader = {};
            wfsloader['spinner']= new Spinner({color: rgb2hex(getStyleColor(wfsMapConfig, 'stroke'))});
            var target = document.createElement('div');
            document.getElementById('getmpage').appendChild(target);

            var wfslayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: (wfsMapConfig.wfs.outputFormat == 'gml3') ? new ol.format.GML3() : 
                            (wfsMapConfig.wfs.outputFormat == 'gml2') ? new ol.format.GML2() : 
                            (wfsMapConfig.wfs.outputFormat == 'kml') ? new ol.format.KML() : 
                            new ol.format.GML3(), // default format
                    url: wfsMapConfig.wfs.url ? function(extent,resolution,proj) {
                        wfsloader['spinner'].spin(target);
                        return wfsMapConfig.wfs.hostAddress + wfsMapConfig.wfs.url 
                            + '&version=' + (wfsMapConfig.wfs.version ? wfsMapConfig.wfs.version : defaultVersion)
                            + (wfsMapConfig.wfs.srs ? ('&srs=' + wfsMapConfig.wfs.srs ) : '')
                            + (wfsMapConfig.wfs.outputFormat ? ('&outputFormat=' + wfsMapConfig.wfs.outputFormat) : '')
                            + '&bbox=' + flipExtent(
                                extent, 
                                '1.0.0',
                                (wfsMapConfig.wfs.version ? wfsMapConfig.wfs.version : defaultVersion)).join(',') ;
                    }: undefined,
                    strategy: //ol.loadingstrategy.bbox, 
                    function(extent, resolution) {
                        wfsloader['spinner'].stop();
                        return [extent];
                    },
                    attributions: [new ol.Attribution({
                        html: '<div style="color:' + getStyleColor(wfsMapConfig) + ';" class="wfs_legend">' + wfsMapConfig.title + '</div>',
                    })],
                }),
                renderBuffer:600,
                updateWhileInteracting: true,
                visible: false,
                style: wfsMapConfig.style.dashed ? (function(feature, resolution){ // function so that styling is dynamic
                    var style0 = new ol.style.Style({ // black boarder
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0,0,0,1)',
                            width: getStyleWidth(wfsMapConfig) * 1.5,
                        }),
                    });
                    var style1 = new ol.style.Style({ // white tiles
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255,255,255,1)',//
                            width: getStyleWidth(wfsMapConfig),
                            lineDash: [10,0],
                            lineCap: 'butt'
                        }),
                    });
                    var style2 = new ol.style.Style({ // white tiles
                        image: new ol.style.Circle({
                            stroke: new ol.style.Stroke({
                                color: getStyleColor(wfsMapConfig, 'stroke'),
                                width: getStyleWidth(wfsMapConfig)
                            }),
                            fill: new ol.style.Fill({
                                color: getStyleColor(wfsMapConfig, 'fill')
                            }),
                            radius: 5
                        }),
                        text: new ol.style.Text({
                            font: '20px Calibri,sans-serif',
                            fill: new ol.style.Fill({ color: '#000' }),
                            // get the text from the feature - `this` is ol.Feature
                            text: '',
                            offsetY: -25
                        }),
                        stroke: new ol.style.Stroke({
                            color: getStyleColor(wfsMapConfig, 'stroke'),
                            width: getStyleWidth(wfsMapConfig),
                            lineDash: [10,10],
                            lineCap: 'butt'
                        }),
                        fill: new ol.style.Fill({
                            color: getStyleColor(wfsMapConfig, 'fill')
                        }),
                    });
                    var styles = [style0,style1, style2];
                    style2.getText().setText((globals.viewLabels && feature.getProperties()) ? feature.getProperties()[wfsMapConfig.label] : '');
                    return styles;
                })() : (function(feature, resolution){ // function so that styling is dynamic
                    var style = new ol.style.Style({ // white tiles
                        image: new ol.style.Circle({
                            stroke: new ol.style.Stroke({
                                color: getStyleColor(wfsMapConfig, 'stroke'),
                                width: getStyleWidth(wfsMapConfig)
                            }),
                            fill: new ol.style.Fill({
                                color: getStyleColor(wfsMapConfig, 'fill')
                            }),
                            radius: 5
                        }),
                        text: new ol.style.Text({
                            font: '20px Calibri,sans-serif',
                            fill: new ol.style.Fill({ color: '#000' }),
                            // get the text from the feature - `this` is ol.Feature
                            text: '',
                            offsetY: -25
                        }),
                        stroke: new ol.style.Stroke({
                            color: getStyleColor(wfsMapConfig, 'stroke'),
                            width: getStyleWidth(wfsMapConfig),
                        }),
                        fill: new ol.style.Fill({
                            color: getStyleColor(wfsMapConfig, 'fill')
                        }),
                    });
                    var styles = [style];
                    style.getText().setText((globals.viewLabels && feature.getProperties()) ? feature.getProperties()[wfsMapConfig.label] : '');
                    return styles;
                })()
            });

            wfslayer.set('name', wfsMapConfig.wfs.name);
            wfslayer.set('selectable', true);
            wfslayers.push(wfslayer);
            globals.counts[wfsMapConfig.wfs.name] = 0;
        }
        
        var wmslayer; // wms
        if(wfsMapConfig.wms != undefined && wfsMapConfig.wms != {}) {
            wmsloader = {};
            wmslayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: wfsMapConfig.wms.hostAddress + wfsMapConfig.wms.url,
                    params: {
                        LAYERS: wfsMapConfig.wms.layers,
                        TILED: true,
                        VERSION: wfsMapConfig.wms.version,
                        SLD_BODY: createSLD(wfsMapConfig),//encodeURI(createSLD())
                        SRS: (wfsMapConfig.wfs.srs ? wfsMapConfig.wfs.srs : '')
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
        } else { // if wms does not exist, display clustering
            wmslayer = new ol.layer.Vector({
                visible: false,
                source: new ol.source.Cluster({
                    source: new ol.source.Vector({
                        format: (wfsMapConfig.wfs.outputFormat == 'gml3') ? new ol.format.GML3() : 
                                (wfsMapConfig.wfs.outputFormat == 'gml2') ? new ol.format.GML2() : 
                                (wfsMapConfig.wfs.outputFormat == 'kml') ? new ol.format.KML() : 
                                new ol.format.GML3(), // default format
                        url: wfsMapConfig.wfs.url ? function(extent,resolution,proj) {
                            return wfsMapConfig.wfs.hostAddress + wfsMapConfig.wfs.url 
                                + '&version=' + (wfsMapConfig.wfs.version ? wfsMapConfig.wfs.version : defaultVersion)
                                + (wfsMapConfig.wfs.srs ? ('&srs=' + wfsMapConfig.wfs.srs ) : '')
                                + (wfsMapConfig.wfs.outputFormat ? ('&outputFormat=' + wfsMapConfig.wfs.outputFormat) : '')
                                + '&bbox=' + flipExtent(
                                    extent, 
                                    '1.0.0',
                                    (wfsMapConfig.wfs.version ? wfsMapConfig.wfs.version : defaultVersion)).join(',') ;
                        }: undefined,
                        strategy: ol.loadingstrategy.bbox,
                        attributions: [new ol.Attribution({
                            html: '<div style="color:' + getStyleColor(wfsMapConfig) + ';" class="wfs_legend">' + wfsMapConfig.title + '</div>',
                            
                        })],
                    }),
                    geometryFunction: function(feature) {
                        return new ol.geom.Point(ol.extent.getCenter(feature.getGeometry().getExtent()));
                    }
                }),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        stroke: new ol.style.Stroke({
                            color: getStyleColor(wfsMapConfig, 'stroke'),
                            width: getStyleWidth(wfsMapConfig)
                        }),
                        fill: new ol.style.Fill({
                            color: getStyleColor(wfsMapConfig, 'fill')
                        }),
                        radius: 5
                    }),
                    stroke: new ol.style.Stroke({
                        color: getStyleColor(wfsMapConfig, 'stroke'),
                        width: getStyleWidth(wfsMapConfig),
                        lineDash: [20,20]
                    }),
                    fill: new ol.style.Fill({
                        color: getStyleColor(wfsMapConfig, 'fill')
                    }),
                })
            })
        }

        // for wms
        
        wmsloader['loading'] = 0;
        wmsloader['loaded'] = 0;
        wmsloader['spinner']= new Spinner({color: rgb2hex(getStyleColor(wfsMapConfig, 'stroke'))});
        var wmssrc = wmslayer.getSource();
        wmssrc.on('tileloadstart', function(){
            wmsloader['loading']++;
            wmsloader['spinner'].spin(target);
            wfsloader['spinner'].stop();
            console.log('tileloadstart');
        });
        wmssrc.on('tileloadend', function(){
            wmsloader['loaded']++;
            if(wmsloader['loaded'] == wmsloader['loading']){
                wmsloader['loaded'] = 0;
                wmsloader['loading'] = 0;
                wmsloader['spinner'].stop();
            }
            console.log('tileloadend');
        });
        wmssrc.on('tileloaderror', function(){
            wmsloader['loaded']++;
            if(wmsloader['loaded'] == wmsloader['loading']){
                wmsloader['loaded'] = 0;
                wmsloader['loading'] = 0;
                wmsloader['spinner'].stop();
            }            
            console.log('tileloaderror');
        });
        wmslayers.push(wmslayer);

        // checkbox will trigger visibility change
        $('#' + wfsMapConfig.name.replace(/\W/g, '') +'_checkbox').click(function(){
            wfslayer.setVisible(this.checked);
            wmslayer.setVisible(this.checked);
        }); 
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
        if(map.getView().getZoom() > CGSWeb_Map.Options.zoomThreshold) {
            map.getLayerGroup().getLayers().getArray()[1] = wfslayerGroup;
            wfslayerGroup.getLayers().getArray().forEach(function(layer){
                (<ol.layer.Vector>layer).getSource().changed();
            });
        } else {
            map.getLayerGroup().getLayers().getArray()[1] = wmslayerGroup;
            wmslayerGroup.getLayers().getArray().forEach(function(layer){
                (<ol.layer.Layer>layer).getSource().changed();
            });
        }
    });

    // update map when view labels is toggled
    $('#viewLabelsButton').click(function(){
        globals.viewLabels = !globals.viewLabels;
        wfslayerGroup.getLayers().getArray().forEach(function(layer){
            (<ol.layer.Vector>layer).getSource().changed();
        });
        map.render();
    });    
}

// sets up the shape layer options
function populateShape(){
    // default global shape layer is index 0
    setGlobalShapeLayer(layerGroups[2].getLayers().item(0));

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
                setGlobalShapeLayer(layerGroups[2].getLayers().item(CGSWeb_Map.Options.layers.shapesConfigs.indexOf(shapeConfig)));        
            });
        });
        // might have to set attribute for older jquery versions
        $('#' + CGSWeb_Map.Options.layers.shapesConfigs[0].name.replace(/\W/g, '') +'_checkbox').prop('checked', true);

        (<HTMLSelectElement>shapeLayerSelect[i]).value = globals.shapeLayer.get('name');
        (<HTMLSelectElement>shapeLayerSelect[i]).onchange = function(){
            $('#' + (<HTMLSelectElement>this).value.replace(/\W/g, '') +'_checkbox').click();
            setGlobalShapeLayer(layerGroups[2].getLayers().item((<HTMLSelectElement>this).selectedIndex));      
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
    layerGroups[2].getLayers().getArray().forEach(function(layer){
        layer.setVisible(false);
    });
    globals.shapeLayer = layer;
    globals.shapeLayer.setVisible(true); 
    setupShapes(); // reflect global shape layer change in getm popup
}

export function mapSetup() {
    //map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize()); // china lake
    populateMap(); // populate layers of map

    // assign the layers to map
    map.setLayerGroup(new ol.layer.Group({
        layers: layerGroups
    }));

    // sets map to take over large portion of page
    window.onresize = mapResize;
    mapResize();
    hover();
}

function hover() {
    var hoverInteraction = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove,
        layers: layerGroups[2].getLayers().getArray()
    });

    map.addInteraction(hoverInteraction);

    var style = new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 10
        })
    });
    hoverInteraction.getFeatures().on('add', function (e){
        var selectedStyle = globals.shapes[e.element.getProperties()['id']].getLayer().getStyle();
        e.element.setStyle(selectedStyle.clone());
        e.element.getStyle().getStroke().setWidth(10);
    });
    hoverInteraction.getFeatures().on('remove', function (e){
        e.element.setStyle(undefined);
    });

}

function getCoordinateFormat(digits: number) {
    return (function(coord: [number, number]) {
        coord = normalizeCoord(coord);
        var swappedCoord = [coord[1], coord[0]] as [number, number];
        return "[" + ol.coordinate.toStringXY(swappedCoord, digits) + "]	" + ol.coordinate.toStringHDMS(coord);
    });
}

function normalizeCoord(coord) {
    // Lon is the only one that wraps.
    var revs = Math.floor(Math.abs(coord[0]) / 360);

    // Shift lon to range (-360, 360).
    if (coord[0] > 0) {
        coord[0] = coord[0] - revs * 360;
    } else {
        coord[0] = coord[0] + revs * 360;
    }

    if (coord[0] > 180) {
        coord[0] = -180 + (coord[0] - 180);
    } else if (coord[0] < -180) {
        coord[0] = 180 + (coord[0] + 180);
    }

    return coord;
}

// fixes firefox issue with canvas resizing and coordinate resetting
function mapResize() {
    console.log('Bottom banner top: ' + $('#bottomBanner').offset().top);
    console.log('Map top: ' + $('#map').offset().top);
    $(map.getTargetElement()).height($('#bottomBanner').offset().top - $('#map').offset().top);  
    map.updateSize();  
}