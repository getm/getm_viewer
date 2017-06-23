var CGSWeb_Map = CGSWeb_Map || {};

CGSWeb_Map.Options = {
	banner_color: "green",
	banner_text: "UNCLASSIFIED",
	baseUrl: "http://localhost:9002/",
	wfsUrl: "http://localhost:8080/",
	layers: {
		baseMapConfigs: [
			{
				title: "OSM",
				url: "http://129.206.228.72/cached/osm/service",
				layer: "osm_auto:all",
				version: "1.1.0",
				arcgis_wmts: false
			},
			{
				title: "USGSTopo",
				url: "http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer",
				layer: "0",
				version: "1.1.0",
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
				srs: "EPSG:4326"
			},
			{
				title: "Web Map Server",
				url: "http://localhost:8080/iaiwebmapserver/IAIWebMapServer",
				layer: "0",
				version: "1.1.0",
				arcgis_wmts: false
			}
		],
		additionalLayersConfigs: [
		],
		wfsMapConfigs: [
			{
				title: 'Airports',
				name: 'airports',
				hostAddress: 'http://localhost:9002/',
				layerWorkspace: 'wfs',
				layerName: 'wfs_airports_layer',
				url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_airports',
				version: '1.1.0',
				style: {
					stroke: {
						color: 'rgba(255,0,0,1)',
						width: 3
					}
				}
			},
			{
				title: 'Roads',
				name: 'roads',
				hostAddress: 'http://localhost:9002/',
				layerName: 'wfs_roads_layer',
				url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_roads',
				version: '1.1.0',
				style: {
					stroke: {
						color: 'rgba(0,0,255,1)',
						width: 3
					}
				}			
			},
			{
				title: 'State Routes',
				name: 'state_routes',
				layerName: 'wfs_state_routes_layer',
				hostAddress: 'http://localhost:9002/',
				url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_state_routes',
				version: '1.1.0',
				style: {
					stroke: {
						color: 'rgba(0,255,0,1)',
						width: 3
					}
				}				
			}     
		],
		shapesConfigs: [
			{
				title: 'tm_prime',
				name: 'tm_prime',
				layerName: 'tm_prime',
				style: {
					stroke: {
						color: 'rgba(255,255,0,1)',
						width: 3
					},
					fill: {
						color: 'rgba(255,255,255,0)',
						width: 3
					}					
				}	
			},
			// {
			// 	title: 'tm_prod',
			// 	name: 'tm_prod',
			// 	layerName: 'tm_prod',
			// 	style: {
			// 		stroke: {
			// 			color: 'rgba(0,255,255,1)',
			// 			width: 3
			// 		},
			// 		fill: {
			// 			color: 'rgba(255,255,255,0)',
			// 			width: 3
			// 		}
			// 	}	
			// }
		]
	},
	resources: [
	]
}

var GeoServerRestInterface = {
	hostAddress: "http://localhost:9002/",
	gsRestUrl: 'GeoServerRest/api/rest/',
    INSERT_AND_UPDATE: 'getm/getm_wms_insert_and_update',
    DELETE: 'getm/getm_wms_delete',
    LAYERS: 'layers',
    getPostInsertAndUpdateUrl: function () {
        return this.hostAddress + this.gsRestUrl + this.INSERT_AND_UPDATE; 
    },
    getPostDeleteUrl: function () {
        return this.hostAddress + this.gsRestUrl + this.DELETE;
    },
    getLayersUrl: function() {
        return this.hostAddress + this.gsRestUrl + this.LAYERS;
    }
};