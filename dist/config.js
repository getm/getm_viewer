var CGSWeb_Map = CGSWeb_Map || {};

CGSWeb_Map.Options = {
	banner_color: "green",
	banner_text: "UNCLASSIFIED",
	baseUrl: "http://localhost:9002/",
	zoomThreshold: 8,
	saveFormat: 'SHAPEFILE',
	map: {
		defaultProjection: 'EPSG:4326',
		defaultZoom: 3,
		defaultCenter: [-117.69069861,35.68503472]
	},
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
				version: "1.1.0",
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
		// Shapetype specifies what geometry type are stored in that layer
		// Possible shapeTypes include: [*, undefined, Point]
		// Default: Line
		wfsMapConfigs: [
			{
				// using this to test if correctly inserted into tm_prime
				title: 'TM Prime',
				name: 'tmprime',		
				shapeType: 'Line',		
				label: 'name',
				wfs: {
					hostAddress: 'http://localhost:9002/',
					url: 'geoserver/getm/ows?service=WFS&request=GetFeature&typeName=getm:tm_prime',
					version: '1.1.0',
					outputFormat: 'gml3'
				},
				wms: {
					hostAddress: 'http://localhost:9002/',
					layers: 'getm:tm_prime',
					url: 'geoserver/getm/wms?service=WMS&request=GetMap',
					version: '1.1.0',
				},
				style: {
					stroke: {
						color: 'rgba(230,100,255,1)',
						width: 3
					}
				}				
			},
			// using this to test other geoserver things
			{
				title: 'MPFPT View',
				name: 'mpfptview',	
				shapeType: 'Point',		
				label: 'name',	
				wfs: {
					hostAddress: 'http://localhost:9002/',
					url: 'geoserver/cite/ows?service=WFS&request=GetFeature&typeName=cite:mpfptview',
					version: '1.1.0',
					outputFormat: 'gml3'
				},
				wms: {
					hostAddress: 'http://localhost:9002/',
					layers: 'cite:mpfptview',
					url: 'geoserver/cite/wms?service=WMS&request=GetMap',
					version: '1.1.0',
				},
				style: {
					stroke: {
						color: 'rgba(230,100,255,1)',
						width: 3
					},
					fill: {
						color: 'rgba(230,100,255,1)'
					}					
				}					
			},			
			// using this to test other geoserver things
			{
				title: 'MPF View',
				name: 'mpfview',				
				wfs: {
					hostAddress: 'http://localhost:9002/',
					url: 'geoserver/cite/ows?service=WFS&request=GetFeature&typeName=cite:mpfview',
					version: '1.1.0',
					outputFormat: 'gml3'
				},
				wms: {
					hostAddress: 'http://localhost:9002/',
					layers: 'cite:mpfview',
					url: 'geoserver/cite/wms?service=WMS&request=GetMap',
					version: '1.1.0',
				},
				style: {
					stroke: {
						color: 'rgba(230,100,255,1)',
						width: 3
					}
				}					
			},
			{
				title: 'Airports',
				name: 'airports',				
				wfs: {
					hostAddress: 'http://localhost:9002/',
					url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_airports',
					version: '1.1.0',
					outputFormat: 'gml3'
				},
				wms: {
					hostAddress: 'http://localhost:9002/',
					layers: 'wfs:cl_airports',
					url: 'geoserver/wfs/wms?service=WMS&request=GetMap',
					version: '1.1.0',
				},
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
				wfs: {
					hostAddress: 'http://localhost:9002/',
					url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_roads',
					version: '1.1.0',	
					outputFormat: 'gml3'
				},
				wms: {
					hostAddress: 'http://localhost:9002/',
					layers: 'wfs:cl_roads',
					url: 'geoserver/wfs/wms?service=WMS&request=GetMap',
					version: '1.1.0',
				},
				style: {
					stroke: {
						color: 'rgba(0,255,0,1)',
						width: 3
					}
				}				
			},
			{
				title: 'State Routes',
				name: 'state_routes',
				wfs: {
					hostAddress: 'http://localhost:9002/',
					url: 'geoserver/wfs/ows?service=WFS&request=GetFeature&typeName=wfs:cl_state_routes',
					version: '1.1.0',	
					outputFormat: 'gml3'			
				},
				wms: {
					hostAddress: 'http://localhost:9002/',
					layers: 'wfs:cl_state_routes',
					url: 'geoserver/wfs/wms?service=WMS&request=GetMap',
					version: '1.1.0',
				},
				style: {
					stroke: {
						color: 'rgba(0,0,255,1)',
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
			{
				title: 'tm_prod',
				name: 'tm_prod',
				layerName: 'tm_prod',
				style: {
					stroke: {
						color: 'rgba(0,255,255,1)',
						width: 3
					},
					fill: {
						color: 'rgba(255,255,255,0)',
						width: 3
					}
				}	
			}
		],
		additionalLayersConfigs: [
		],		
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

var ProductRestInterface = {
	hostAddress: "http://localhost:9002/",
	productRestUrl: 'product/api/rest/',
	productResultUrl: 'product',
	SAVE_SHAPES: 'save_shapes',
    getSaveShapesUrl: function () {
        return this.hostAddress + this.productRestUrl + this.SAVE_SHAPES; 
    },
	getResultUrl: function() {
		return this.hostAddress + this.productResultUrl;
	}
};

// list of each of the layer info fields
var layerInfoRequirements = [
    { // benumber
        val: 'benumber',
        type: 'java.lang.String',
        regex: '[0,1][0-8]\\d{2}[A-Z,-][A-Z,0-9]\\d{4}',
        example: '1234-12345'
    },
    { // osuffix
        val: 'osuffix',
        type: 'java.lang.String',
        regex: '[A-Z]{2}\\d{3}',
        example: 'DD001'
    },
    { // tgt_coor
        val: 'tgt_coor',
        type: 'java.lang.String',
        regex: '^(\\d{1,2}[\\d.]{0,1}\\d{0,3})[NS][ ](\\d{1,3}[\\d.]{0,1}\\d{0,3})[EW]',
        example: '123456N 1234567E'
    },
    { // tgt_name
        val: 'tgt_name',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,256}',
        example: 'SPIRIT OF ST LOUIS AIR PORT'
    },
    { // catcode
        val: 'catcode',
        type: 'java.lang.String',
        regex: '\\d{5}',
        example: '80000'
    },
    { // country
        val: 'country',
        type: 'java.lang.String',
        regex: '[A-Z,a-z]{2}',
        example: 'US'
    },
    { // label
        val: 'label',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,10}',
        example: 'label'
    },      
    { // feat_name
        val: 'feat_name',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{0,254}',
        example: 'Runway'
    },
    { // out_ty
        val: 'out_ty',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,50}',
        example: 'Installation',
        options: ['Installation', 'Facility', 'Functional Area', 'Critical Element', 'Element', 'Collateral area', 'POI']
    },
    { // notional
        val: 'notional',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,3}',
        example: 'Yes',
        options: ['Yes','No']
    },
    { // ce_l
        val: 'ce_l',
        type: '[-+]?[0-9]*\\.?[0-9]+',
        regex: '[A-Z,a-z,0-9]{1,10}',
        example: '4000'
    },      
    { // ce_w
        val: 'ce_w',
        type: '[-+]?[0-9]*\\.?[0-9]+',
        regex: '[A-Z,a-z,0-9]{1,10}',
        example: '100'
    },
    { // ce_h
        val: 'ce_h',
        type: 'java.math.BigDecimal',
        regex: '[-+]?[0-9]*\\.?[0-9]+',
        example: '0'
    },
    { // c_pvchar
        val: 'c_pvchar',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,20}',
        example: 'RC'
    },
    { // conf_lvl
        val: 'conf_lvl',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,24}',
        example: 'Confirmed',
        options: ['Confirmed', 'Probable', 'Possible']
    },      
    { // icod
        val: 'icod',
        type: 'java.sql.Timestamp',
        regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
        example: '1/30/2015'
    },      
    { // class
        val: 'class',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,12}',
        example: 'UNCLASSIFIED',
        options: ['UNCLASSIFIED', 'SECRET', ' TOP SECRET']
    },      
    { // release
        val: 'release',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1}',
        example: 'X',
        options: ['X', 'A', 'B', 'C', 'D']
    },      
    { // control
        val: 'control',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,32}',
        example: 'control'
    },      
    { // drv_from
        val: 'drv_from',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,48}',
        example: 'GEOINT SCG Annex',
        options: ['GEOINT SCG Annex','TARGET Materials SCG, 3 March 2015']
    },      
    { // c_reason
        val: 'c_reason',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s,\(,\),\.]{1,20}',
        example: '1.4 (a)(c)(g)',
        options: ['1.4 (a)(c)(g)']
    },      
    { // decl_on
        val: 'decl_on',
        type: 'java.lang.String',
        regex: '[2][5][x][1][,][ ]\\d{8}',
        example: '25x1, 20400210'             
    },      
    { // source
        val: 'source',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,_]{1,20}',
        example: '25MAR07IK0101063po'     
    },      
    { // c_method
        val: 'c_method',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9,\\s]{1,64}',
        example: 'Stereo DPPDB collection',
        options: ['Terrain Corrected Mono Collection', 'Stereo DPPDB collection']  
    },      
    { // doi
        val: 'doi',
        type: 'java.sql.Timestamp',
        regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
        example: '03/25/2007'     
    },      
    { // c_date
        val: 'c_date',
        type: 'java.sql.Timestamp',
        regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
        example: '6/13/2017'     
    },      
    { // circ_er
        val: 'circ_er',
        type: 'java.math.BigDecimal',
        regex: '-1',
        example: '-1'     
    },      
    { // lin_er
        val: 'lin_er',
        type: 'java.math.BigDecimal',
        regex: '-1',
        example: '-1'     
    },      
    { // producer
        val: 'producer',
        type: 'java.lang.Short',
        regex: '\\d{1,3}',
        example: '1',
        options: [1, 2, 3, 4, 5, 6, 7, 8] 
    },      
    { // analyst
        val: 'analyst',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: '1234567'    
    },      
    { // qc
        val: 'qc',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: '1234567'    
    },      
    { // class_by
        val: 'class_by',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: '1234567'    
    },      
    { // tot
        val: 'tot',
        type: 'java.lang.String',
        regex: '\\d{4}[Z]',
        example: '1259Z'    
    },      
    { // shape
        val: 'shape',
        type: 'com.vividsolutions.jts.geom.Geometry',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: 'shape'       
    },      
    { // chng_req
        val: 'chng_req',
        type: 'java.lang.String',
        regex: '[A-Z,a-z,0-9]{1,50}',
        example: 'ABCD01'  
    },      
    { // d_state
        val: 'd_state',
        type: 'java.lang.Short',
        regex: '\\d{1,3}',
        example: '12'                                                                                                                                                  
    }            
];