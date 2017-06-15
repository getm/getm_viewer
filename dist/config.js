var CGSWeb_Map = CGSWeb_Map || {};


CGSWeb_Map.Options = {
	banner_color: "green",
	banner_text: "UNCLASSIFIED",
	baseUrl: "http://localhost:8080/",
	wfsUrl: "http://localhost:8080/",
	beUrl: "http://localhost:9000/be/",
	mdalUrl: "http://localhost:9000/mdal",
	cgswebUrl: "http://localhost:8080/cgsweb/",
	parseMdalUrl: "http://localhost:8080/cgsweb/",
	newsUrl: 'news-map.html',
	initMpfEnabled: true,
	initNitfEnabled: true,
	initStereoOnlyEnabled: false,
	initCloudCoverageEnabled: false,
	initNiirsEnabled: false,
	cloudCoverageDefault: 100,
	minNiirsDefault: 0,
	maxNiirsDefault: 9,
	baseMapConfigs: [
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

	sensors: 
	[
      {
    	  name: "DigitalGlobe", 
    	  filter: ",DigitalGlobe",
    	  color: "rgba(250, 0, 0, 1)",
    	  fill: "rgba(250, 0, 0, 0.2)",
    	  isEnabled: true
      }, 
      {
    	  name: "RADARSAT-2",
    	  filter: ",RADARSAT-2",
    	  color: "rgba(199, 185, 21, 1)",
    	  fill: "rgba(199, 185, 21, 0.2)",
    	  isEnabled: true
      },
      {
    	  name: "RS2",
    	  filter: ",RS2",
    	  color: "rgba(48, 161, 52, 1)",
    	  fill: "rgba(48, 161, 52, 0.2)",
    	  isEnabled: true
      },
      {
    	  name: "GEOEYE1",
    	  filter: ",GEOEYE1",
    	  color: "rgba(47, 187, 164, 1)",
    	  fill: "rgba(47, 187, 164, 0.2)",
    	  isEnabled: true
      },
      {
    	  name: "IKONOS",
    	  filter: ",IKONOS",
    	  color: "rgba(66, 133, 244, 1)",
    	  fill: "rgba(66, 133, 244, 0.2)",
    	  isEnabled: true
      },
      {
    	  name: "CSKS2",
    	  filter: ",CSKS2",
    	  color: "rgba(119, 28, 191, 1)",
    	  fill: "rgba(119, 28, 191, 0.2)",
    	  isEnabled: true
      },
      {
    	  name: "SPACE",
    	  filter: ",SPACE",
    	  color: "rgba(191, 28, 165, 1)",
    	  fill: "rgba(191, 28, 165, 0.2)",
    	  isEnabled: true
      } 
   ],
   unknownSensor: {
 	  color: "rgba(7, 75, 203, 1)",
 	  fill: "rgba(7, 75, 203, 0.2)"
   },
   dppdb : {
	   color: "rgba(240, 173, 78, 1.0)",
	   fill: "rgba(240, 173, 78, 0.2)"
   },
   wfsFields: {
		nitfTable: 'stateview',
		nitfPTTable: 'stateptview',
		mpfTable: 'mpfview',
		mpfPTTable: 'mpfptview',
		date: 'prodDate',
		corners: 'corners',
		sensor: 'sensor',
		name: 'name',
		cloudcoverage: 'cloudcoverage',
		niirs: 'niirs',
		stereomate: 'stereomate',
		overview : 'overview'
	},
	resources: [
	]
}

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
        url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_airports',
        version: '1.1.0',
        color: 'rgba(255,0,0,1)'
    },
    {
        title: 'Roads',
        name: 'roads',
        hostAddress: 'http://localhost:9002/',
        url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_roads',
        version: '1.1.0',
        color: 'rgba(0,0,255,1)'
    },
    {
        title: 'State Routes',
        name: 'state_routes',
        hostAddress: 'http://localhost:9002/',
        url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_state_routes',
        version: '1.1.0',
        color: 'rgba(0,255,0,1)'
    }     
];

/*var baseMapConfigs= [
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
];*/

var shapeLayerOptions = ['tm_prime', 'tm_prod', 'tm_release'];
