import './css/map.css';
import * as ol from 'openlayers';
import * as $ from 'jquery';
import {globals} from './globals';
import {setupShapes} from './getm';

const BASE_MAP_LAYER = 0;
var attribution = new ol.control.Attribution({});

var controls = new ol.Collection([new ol.control.FullScreen(),attribution, new ol.control.Zoom()])
export const map = new ol.Map({
    target: 'map',
    controls: controls
});
var fill = new ol.style.Fill({
    color: 'rgba(255,255,255,0.4)'
});
var style = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(255,0,0,1)'
    }),
    fill:fill
});
map.setView(new ol.View({
    // projection: 'EPSG:900913',
    projection: 'EPSG:4326',
    // maxZoom: 19,
    //zoom: 12,
    center: [0, 0],
    zoom: 3
}));

var wfs_airports_source = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: wfsRestInterface.getAirportsUrl(),
    strategy: ol.loadingstrategy.bbox,
    attributions: [new ol.Attribution({
        html: '<div id="airports_attribution">Airports</div>'
    })]
});

var wfs_roads_source = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: wfsRestInterface.getRoadsUrl(),
    strategy: ol.loadingstrategy.bbox,
    attributions: [new ol.Attribution({
        html: '<div id="roads_attribution">Roads</div>'
    })]
});

var wfs_state_routes_source = new ol.source.Vector({
    format: new ol.format.GML3(),
    url: wfsRestInterface.getStateRoutesUrl(),
    strategy: ol.loadingstrategy.bbox,
    attributions: [new ol.Attribution({
        html: '<div id="state_routes_attribution">State Routes</div>'
    })]
});

var wfs_airports_layer = new ol.layer.Vector({
    source: wfs_airports_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
        })
    }),
    visible: false,
});

var wfs_roads_layer = new ol.layer.Vector({
    source: wfs_roads_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 1.0)',
            width: 2
        })
    }),
    visible: false
});

var wfs_state_routes_layer = new ol.layer.Vector({
    source: wfs_state_routes_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 255, 0, 1.0)',
            width: 2
        })
    }),
    visible: false
});

// if(globals.debug)
map.getView().fit([-117.90295999999988, 35.551014000000066, -117.54647999999992, 35.71793700000006], map.getSize());
ol.source.WMTS
const mapLayers = {};
var mapLayerCount = 0;

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

        mapLayers['layer' + i] = new ol.layer.Tile({
            // 'title': baseMapConfigs[i].title,
            visible: true,
            // type: 'base',
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
        mapLayers['layer' + i] = new ol.layer.Tile({
            // 'title': baseMapConfigs[i].title,
            visible: true,
            // type: 'base',
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

export var shapeLayer;
var shapeLayerOptions = ['tm_prime', 'tm_prod', 'tm_release', 'all'];
var shapeLayers = [];

function populateMap() {
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
            map.getLayerGroup().getLayers().setAt(BASE_MAP_LAYER, mapLayers[(<HTMLSelectElement>this).value]);
            
        };
        mapLayerSelect[i].appendChild(cln);
    }
    
    // toggle airports
    $('#airports_checkbox').click(function(){
        wfs_airports_layer.setVisible((<HTMLInputElement>document.getElementById('airports_checkbox')).checked);
    });

    // toggle roads
    $('#roads_checkbox').click(function(){
        wfs_roads_layer.setVisible((<HTMLInputElement>document.getElementById('roads_checkbox')).checked);
    });

    // toggle state routes
    $('#state_routes_checkbox').click(function(){
        wfs_state_routes_layer.setVisible((<HTMLInputElement>document.getElementById('state_routes_checkbox')).checked);
    });

    $('#legend').click(function(){
        attribution.setCollapsed(!attribution.getCollapsed());
    });
}

function populateShape(){
    // generate the sources and layers for the shapes
    for(var i = 0; i < shapeLayerOptions.length; i++) {
        var source = new ol.source.Vector({});
        var vector = new ol.layer.Vector({source: source, visible: false, style: style});
        vector.set('selectable', true);
        vector.set('name', shapeLayerOptions[i]);
        shapeLayers.push(vector);
    }

    shapeLayer = shapeLayers[0];
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
                shapeLayer = shapeLayers[(<HTMLSelectElement>this).selectedIndex];
                for(var j = 0; j < (<HTMLSelectElement>this).length - 1; j++ ){
                    shapeLayers[j].setVisible(false);
                }
                shapeLayers[(<HTMLSelectElement>this).selectedIndex].setVisible(true);                
            } else  {
                shapeLayer = shapeLayers[0]; // all is set to default value
                for(var j = 0; j < (<HTMLSelectElement>this).length - 1; j++ ){
                    shapeLayers[j].setVisible(true);
                }
            }
            setupShapes();     
        };        
    }
}

export function populateLayers(){
    populateMap();
    populateShape();
    var layers = [mapLayers['layer0'], // basemap layer
        new ol.layer.Group({layers: [wfs_airports_layer, wfs_roads_layer, wfs_state_routes_layer]}),  // wfs layers
        new ol.layer.Group({layers: shapeLayers}) // shape layers
    ];
    map.setLayerGroup(new ol.layer.Group({
        layers: layers
    }));
}
