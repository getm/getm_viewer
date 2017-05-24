export const GeoServerRestInterface = {
    hostAddress: 'http://localhost:9002/',
    INSERT: 'getm/getm_wms_insert_and_update',
    DELETE: 'getm/getm_wms_delete',
    getPostInsertUrl: function () {
        return this.hostAddress + '/GeoServerRest/api/rest/' + this.INSERT; 
    },
    getPostDeleteUrl: function () {
        console.log(this.hostAddress + 'GeoServerRest/api/rest/' + this.DELETE);
        return this.hostAddress + 'GeoServerRest/api/rest/' + this.DELETE;
    },
    getLayersUrl: function() {
        return this.hostAddress + '/GeoServerRest/api/rest/layers'
    }
}
