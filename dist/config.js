export const GeoServerRestInterface = {
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
}


export const wfsRestInterface = {
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
}
