var GeoServerRestInterface = {
    hostAddress: 'http://localhost:9002/',
    INSERT: 'getm/getm_wms_insert_and_update',
    DELETE: 'getm/getm_wms_delete',
    LAYERS: 'layers',
    getPostInsertUrl: function () {
        return this.hostAddress + 'GeoServerRest/api/rest/' + this.INSERT; 
    },
    getPostDeleteUrl: function () {
        return this.hostAddress + 'GeoServerRest/api/rest/' + this.DELETE;
    },
    getLayersUrl: function() {
        return this.hostAddress + 'GeoServerRest/api/rest/' + this.LAYERS;
    }
};

var wfsMapConfigs = [
    {
        title: 'Airports',
        name: 'airports',
        hostAddress: 'http://localhost:9002/',
        url: 'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_airports',
        format: 'GML3',
        color: 'rgba(255,0,0,1)'
    },
    {
        title: 'Roads',
        name: 'roads',
        hostAddress: 'http://localhost:9002/',
        url: 'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_roads',
        format: 'GML3',
        color: 'rgba(0,0,255,1)'
    },
    {
        title: 'State Routes',
        name: 'state_routes',
        hostAddress: 'http://localhost:9002/',
        url: 'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=wfs:cl_state_routes',
        format: 'GML3',
        color: 'rgba(0,255,0,1)'
    }     
];

var baseMapConfigs= [
    {
        title: "OSM",
        url: "http://129.206.228.72/cached/osm/service",
        layer: "osm_auto:all",
        version: "1.1.1",
        arcgis_wmts: false
    },
    {
        title: "USGSTopo",
        url: "http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer",
        layer: "0",
        version: "1.1.1",
        arcgis_wmts: false
    },
    {
        title: "ArcGIS Topo",
        url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/tile/1.0.0/USGSTopo/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}",
        layer: "0",
        version: "1.1.1",
        arcgis_wmts: true,
        tilesize: 256,
        levels: 20,
        srs: "EPSG:3857"
    },
    {
        title: "Web Map Server",
        url: "http://localhost:8080/iaiwebmapserver/IAIWebMapServer",
        layer: "0",
        version: "1.1.0",
        arcgis_wmts: false
    }
];

var shapeLayerOptions = ['tm_prime', 'tm_prod', 'tm_release'];