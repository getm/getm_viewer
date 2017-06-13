var GeoServerRestInterface = {
    hostAddress: 'http://localhost:9002/',
    INSERT: 'getm/getm_wms_insert_and_update',
    DELETE: 'getm/getm_wms_delete',
    LAYERS: 'layers',
    getPostInsertUrl: function () {
        return this.hostAddress + '/GeoServerRest/api/rest/' + this.INSERT; 
    },
    getPostDeleteUrl: function () {
        return this.hostAddress + 'GeoServerRest/api/rest/' + this.DELETE;
    },
    getLayersUrl: function() {
        return this.hostAddress + '/GeoServerRest/api/rest/' + this.LAYERS;
    }
};


var wfsRestInterface = {
    hostAddress: 'http://localhost:9002/',
    FORMAT: '&outputFormat=GML3',
    REQUEST: 'geoserver/wfs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=',
    getStateRoutesUrl: function () {
        return this.hostAddress + this.REQUEST + 'wfs:cl_state_routes' + this.FORMAT; 
    },
    getRoadsUrl: function () {
        return this.hostAddress + this.REQUEST + 'wfs:cl_roads' + this.FORMAT;
    },
    getAirportsUrl: function() {
        return this.hostAddress + this.REQUEST + 'wfs:cl_airports' + this.FORMAT;
    }
};

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
]
