window.CGSWeb_Map = {
    title: "GETM",
    version: '',
    sponsorImage: 'images/NGA.png',

	bannerColor: "green",
    bannerClassification: "UNCLASSIFIED",

    validText: "Geospatially Enabled Target Materials",
    
    baseUrl: "http://localhost:8080/",
    beUrl: "http://localhost:8080/",
    mdalUrl: "http://localhost:8080/",
    parseMdalUrl: "http://localhost:8080/",
    authService: 'http://localhost:9002/auth',
    dbService: 'http://localhost:9002/cgswebdbrest',
	zoomThreshold: 8,
	saveFormat: 'SHAPEFILE',
    defaultProjection: 'EPSG:4326',
    defaultCenter: [0,0],
    defaultZoom: 3,

    navigation: [
        {
            section: 'Workflows',
            links: [
                {name: 'Image', newTab: false, url: 'http://localhost:9001/image'},
                {name: 'DPPDB', newTab: false, url: 'http://localhost:9001/dppdb'},
                {name: 'MIG', newTab: false, url: 'http://localhost:9001/mig'},
                {name: 'SIG', newTab: false, url: 'http://localhost:9001/sig'},
                {name: 'Resection', newTab: false, url: 'http://localhost:9001/resection'},
                {name: 'APG', newTab: false, url: 'http://localhost:9001/apg'},
                {name: 'Review', newTab: false, url: 'http://localhost:9001/review'}
            ]
        }
    ],
    
	mapConfigs: [
        {
            title: "OSM",
            url: "http://129.206.228.72/cached/osm/service",
            layer: "osm_auto:all",
            version: "1.1.0",
            arcgis_wmts: false,
            visible: false
        },
        {
            title: "USGSTopo",
            url: "http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer",
            layer: "0",
            version: "1.1.0",
            arcgis_wmts: false,
            visible: true
        }
    ],

    wmsLayerConfig: {
        hostAddress: 'http://localhost:8080/',
        url: 'geoserver/wms?service=WMS&request=GetMap',
        layers: '',
        version: '1.1.0',
        minResolution: 0.01,
        maxResolution: Infinity
    },

    layerConfigs: [
        {
            title: 'TM Prime',
            visible: true,
            wfs: {
                hostAddress: 'http://localhost:8080/',
                url: 'geoserver/ows?SERVICE=WFS&REQUEST=GetFeature&TYPENAME=getm:tm_prime',
                version: '1.1.0',
                outputFormat: 'gml3',
                minResolution: 0,
                maxResolution: 0.01,
                style: {
                    dashed: true,
                    color: '#FF0000',
                    width: 3,
                    labelKey: 'benumber'
                }
            },
            wms: {
                layer: 'getm:tm_prime'
            }				
        }		   
    ],
    
    featureMetadataRequirements: [
        {
            name: 'Group1',
            data: [{ // benumber
                val: 'benumber',
                name: 'BE Number',
                type: 'java.lang.String',
                regex: '[0,1][0-8]\\d{2}[A-Z,-][A-Z,0-9]\\d{4}',
                example: '1234-12345'
            },
            { // osuffix
                val: 'osuffix',
                name: 'O Suffix',
                type: 'java.lang.String',
                regex: '[A-Z]{2}\\d{3}',
                example: 'DD001'
            },
            { // tgt_coor
                val: 'tgt_coor',
                name: 'Target Coordinate',
                type: 'java.lang.String',
                regex: '^(\\d{1,2}[\\d.]{0,1}\\d{0,3})[NS][ ](\\d{1,3}[\\d.]{0,1}\\d{0,3})[EW]',
                example: '123456N 1234567E'
            },
            { // tgt_name
                val: 'tgt_name',
                name: 'Target Name',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{1,256}',
                example: 'SPIRIT OF ST LOUIS AIR PORT'
            },
            { // catcode
                val: 'catcode',
                name: 'Category Code',
                type: 'java.lang.String',
                regex: '\\d{5}',
                example: '80000'
            }]
        },
        {
            name: 'Group2',
            data: [{ // country
                val: 'country',
                name: 'Country',
                type: 'java.lang.String',
                regex: '[A-Z,a-z]{2}',
                example: 'US'
            },
            { // label
                val: 'label',
                name: 'Label',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,10}',
                example: 'label'
            },      
            { // feat_name
                val: 'feat_name',
                name: 'Feature Name',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{0,254}',
                example: 'Runway'
            },
            { // out_ty
                val: 'out_ty',
                name: 'Type',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{1,50}',
                example: 'Installation',
                options: ['Installation', 'Facility', 'Functional Area', 'Critical Element', 'Element', 'Collateral area', 'POI']
            },
            { // notional
                val: 'notional',
                name: 'Notional',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{1,3}',
                example: 'Yes',
                options: ['Yes','No']
            },
            { // ce_l
                val: 'ce_l',
                name: 'CE L',
                type: '[-+]?[0-9]*\\.?[0-9]+',
                regex: '[A-Z,a-z,0-9]{1,10}',
                example: '4000'
            },      
            { // ce_w
                val: 'ce_w',
                name: 'CE W',
                type: '[-+]?[0-9]*\\.?[0-9]+',
                regex: '[A-Z,a-z,0-9]{1,10}',
                example: '100'
            },
            { // ce_h
                val: 'ce_h',
                name: 'CE H',
                type: 'java.math.BigDecimal',
                regex: '[-+]?[0-9]*\\.?[0-9]+',
                example: '0'
            },
            { // c_pvchar
                val: 'c_pvchar',
                name: 'C Pvchar',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,20}',
                example: 'RC'
            },
            { // conf_lvl
                val: 'conf_lvl',
                name: 'Confidence Level',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,24}',
                example: 'Confirmed',
                options: ['Confirmed', 'Probable', 'Possible']
            },      
            { // icod
                val: 'icod',
                name: 'ICOD',
                type: 'java.sql.Timestamp',
                regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
                example: '1/30/2015'
            }]
        }, 
        {
            name: 'Group3',
            data: [{ // class
                val: 'class',
                name: 'Classification',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{1,12}',
                example: 'UNCLASSIFIED',
                options: ['UNCLASSIFIED', 'SECRET', ' TOP SECRET']
            },      
            { // release
                val: 'release',
                name: 'Releasability',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1}',
                example: 'X',
                options: ['X', 'A', 'B', 'C', 'D']
            },      
            { // control
                val: 'control',
                name: 'Control',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,32}',
                example: 'control'
            },      
            { // drv_from
                val: 'drv_from',
                name: 'Derived From',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{1,48}',
                example: 'GEOINT SCG Annex',
                options: ['GEOINT SCG Annex','TARGET Materials SCG, 3 March 2015']
            },      
            { // c_reason
                val: 'c_reason',
                name: 'Reason',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s,\(,\),\.]{1,20}',
                example: '1.4 (a)(c)(g)',
                options: ['1.4 (a)(c)(g)']
            },      
            { // decl_on
                val: 'decl_on',
                name: 'Declassify On',
                type: 'java.lang.String',
                regex: '[2][5][x][1][,][ ]\\d{8}',
                example: '25x1, 20400210'             
            },      
            { // source
                val: 'source',
                name: 'Source',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,_]{1,20}',
                example: '25MAR07IK0101063po'     
            },      
            { // c_method
                val: 'c_method',
                name: 'Method',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9,\\s]{1,64}',
                example: 'Stereo DPPDB collection',
                options: ['Terrain Corrected Mono Collection', 'Stereo DPPDB collection']  
            },      
            { // doi
                val: 'doi',
                name: 'DOI',
                type: 'java.sql.Timestamp',
                regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
                example: '03/25/2007'     
            },      
            { // c_date
                val: 'c_date',
                name: 'Classification Date',
                type: 'java.sql.Timestamp',
                regex: '([0-1]{0,1}\\d{0,1}[/][0-3]{0,1}\\d{0,1}[/]\\d{4})(?![^\\0])',
                example: '6/13/2017'     
            }]
        },
        {
            name: 'Group4',
            data: [{ // circ_er
                val: 'circ_er',
                name: 'Circular Error',
                type: 'java.math.BigDecimal',
                regex: '-1',
                example: '-1'     
            },      
            { // lin_er
                val: 'lin_er',
                name: 'Linear Error',
                type: 'java.math.BigDecimal',
                regex: '-1',
                example: '-1'     
            },      
            { // producer
                val: 'producer',
                name: 'Producer',
                type: 'java.lang.Short',
                regex: '\\d{1,3}',
                example: '1',
                options: ['1', '2', '3', '4', '5', '6', '7', '8'] 
            },      
            { // analyst
                val: 'analyst',
                name: 'Analyst',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,50}',
                example: '1234567'    
            },      
            { // qc
                val: 'qc',
                name: 'QC',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,50}',
                example: '1234567'    
            },      
            { // class_by
                val: 'class_by',
                name: 'Classified By',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,50}',
                example: '1234567'    
            },      
            { // tot
                val: 'tot',
                name: 'TOT',
                type: 'java.lang.String',
                regex: '\\d{4}[Z]',
                example: '1259Z'    
            },      
            { // shape
                val: 'shape',
                type: 'com.vividsolutions.jts.geom.Geometry',
                regex: '[A-Z,a-z,0-9]{1,50}',      
            },      
            { // chng_req
                val: 'chng_req',
                name: 'Change Required',
                type: 'java.lang.String',
                regex: '[A-Z,a-z,0-9]{1,50}',
                example: 'ABCD01'  
            },      
            { // d_state
                val: 'd_state',
                name: 'D State',
                type: 'java.lang.Short',
                regex: '\\d{1,3}',
                example: '12'                                                                                                                                                  
            }]
        }   
    ]
}

var GeoServerRestInterface = {
	hostAddress: "http://localhost:8080/",
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
	hostAddress: "http://localhost:8080/",
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