/*
 *This is a port of CoordinateManager.java (common coord)
 *
 * 
 * The CoordinateManager class provides a static factory method for creating a
 * GeoCoordinate from an input string. The class supports many input formats
 * including the following:
 *
 * Decimal:
 *   12.345;123.345
 * DMS:
 *	 12:34:56.789N;123:45:67.890W
 *   12 34 56.789N;123 45 67.890W
 *   123456.789N;1234567.890W
 *   123456.789;-1234567.890
 * UTM:
 *   12N 34567E 89012N
 *   12N34567E89012N
 *   12 34567 89012
 *   123456789012
 * DM:
 *	 12:34.56789N;123:45.67890W
 *   12 34.56789N;123 45.67890W
 *   123456.789N;1234567.890W
 *   123456.789;-1234567.890    
 * MGRS:
 *   12ABC 34567 89012
 *   12ABC3456789012
 * 
 * Requires: geo.js
 * 			 utm.js
 * 			 mgrs.js
 * 			 dms.js
 */

GEO.namespace("GEO.manager");

GEO.manager = (function() {
	var  DECIMAL_REG = /^-?\d{0,3}\.?\d*\s?[nsew]?$/i,
		 DMS_REG = /^\d{0,3}[:\s]\d{1,2}[:\s]\d{1,2}\.?\d*\s?[nsew]$/i,
		 DM_REG = /^\d{0,3}[:\s]\d{1,2}\.?\d*\s?[nsew]$/i,
		 DMS_REG_NO_SPACES_LAT = /^\d{6}\.?\d*\s?[ns]$/i,
		 DMS_REG_NO_SPACES_LON = /^\d{7}\.?\d*\s?[ew]$/i,
		 UTM_PAIR = /^\d{1,2}[c-x-+]\s\d+\.?\d*\s\d+\.?\d*$/i,
		 MGRS_PAIR = /^([1-9]|[0-5]\d|60)\s?[c-hj-np-x]\s?[a-hj-np-z][a-hj-np-v]\s?\d{5}\s?\d{5}$/i;
	
	function addSeperators(coord, isLat){
		var firstDiv = isLat ? 2 : 3;
		
		return coord.substr(0, firstDiv) + ":" + coord.substr(firstDiv, 2) + 
										":" + coord.substr(firstDiv + 2);
	}
	
	function parseUTM(input){
		var northing,
			easting,
			zone,
			southHemisphere = false,
			parts;
		
		parts = input.split(" ");

		zone = parseInt(parts[0].substr(0, (parts[0].length == 3 ? 2 : 1)));
		if(parts[0].substr(-1).toLowerCase() < "n" && 
				parts[0].substr(-1) != "+"){
			southHemisphere = true;
		}

		easting = parseFloat(parts[1]);
		
		northing = parseFloat(parts[2]);

		return {
			northing: northing,
			easting: easting,
			zone: zone,
			southHemisphere: southHemisphere
		};
	}
	
	function parseMGRS(input){
		var northing,
			easting,
			zone,
			zoneCode,
			tie, 
			southHemisphere = false,
			parts;
		
		input = input.replace(/ /g,"");
		if(input.length != 15){
			if(!(/^[\d]{2}$/.test(input.substr(0,2)))){
				input = "0".concat(input);
			}
		}
		
		zone = parseInt(input.substr(0,2));
		zoneCode = input.substr(2,1);
		tie = input.substr(3,2);
		easting = parseInt(input.substr(5,5));
		northing = parseInt(input.substr(10,5));
		
		if(zoneCode.toLowerCase() < "n"){
			southHemisphere = true;
		}

		return {
			northing: northing,
			easting: easting,
			zone: zone,
			southHemisphere: southHemisphere,
			tie: tie,
			zoneCode: zoneCode
		};
	}
	
	function StringToLatLon(input){
		var // Dependencies 
			utm = GEO.utm,
			mgrs = GEO.mgrs,
			dms = GEO.dms,
		
			resultLat = Number.NaN,
			resultLon = Number.NaN,
			parts,
			tmpcoord,
			tmpstring;
		
		// Make sure all strings are using . for decimal separator
		input = input.replace(",",".");
		parts = input.split(";");
		if(parts.length == 2){
			// Decimal:
			//  12.345;123.345
			if(DECIMAL_REG.test(parts[0]) && DECIMAL_REG.test(parts[1])){
				resultLat = parseFloat(parts[0], 10);
				if(/s$/i.test(parts[0])){
					resultLat = -1 * resultLat;
				}
				resultLon = parseFloat(parts[1], 10);
				if(/w$/i.test(parts[1])){
					resultLon = -1 * resultLon;
				}
			// DMS:
			//	 12:34:56.789N;123:45:67.890W
			//   12 34 56.789N;123 45 67.890W
			//   123456.789N;1234567.890W
			//   123456.789;-1234567.890
			}else if((DMS_REG.test(parts[0]) && DMS_REG.test(parts[1])) ||
					(DM_REG.test(parts[0]) && DM_REG.test(parts[1]))){
				tmpcoord = dms.DMSToLatLon(parts[0], parts[1]);
				resultLat = tmpcoord.lat;
				resultLon = tmpcoord.lon;
			}else if((DMS_REG_NO_SPACES_LAT.test(parts[0]) && 
					DMS_REG_NO_SPACES_LON.test(parts[1]))){
				parts[0] = addSeperators(parts[0], true);
				parts[1] = addSeperators(parts[1], false);
				
				tmpcoord = dms.DMSToLatLon(parts[0], parts[1]);
				resultLat = tmpcoord.lat;
				resultLon = tmpcoord.lon;
			}
		}else if(parts.length == 1){
			// UTM:
			//   12N 34567E 89012N
			//   12N34567E89012N
			//   12 34567 89012
			if(UTM_PAIR.test(parts[0])){
				tmpcoord = parseUTM(parts[0]);
				tmpcoord = utm.UTMXYToLatLon(tmpcoord.easting, tmpcoord.northing, 
						tmpcoord.zone, tmpcoord.southHemisphere);
				resultLat = tmpcoord.lat;
				resultLon = tmpcoord.lon;
			// MGRS:
            //   12ABC 34567 89012
            //   12ABC3456789012
			}else if(MGRS_PAIR.test(parts[0])){
				tmpcoord = parseMGRS(parts[0]);
				tmpcoord = mgrs.MGRSToLatLon(tmpcoord.easting, tmpcoord.northing,
						tmpcoord.zone, tmpcoord.zoneCode, tmpcoord.tie, tmpcoord.southHemisphere);
				resultLat = tmpcoord.lat;
				resultLon = tmpcoord.lon;
			}
		}else{
			throw new RangeError("Input does not match any supported coordinate format");
		}
		
		return {
			lat: resultLat,
			lon: resultLon
		}
	}
	
	function TestLat(input){
		
		// Make sure all strings are using . for decimal separator
		input = input.replace(/,/g,".");

			if(DECIMAL_REG.test(input) ||
				DMS_REG.test(input) ||
				DM_REG.test(input) ||
				DMS_REG_NO_SPACES_LAT.test(input) ||
				UTM_PAIR.test(input) || 
				MGRS_PAIR.test(input)){
				return true;
			}

		
		return false;
	}
	
	function TestLon(input){
		
		// Make sure all strings are using . for decimal separator
		input = input.replace(/,/g,".");

			if(DECIMAL_REG.test(input) ||
				DMS_REG.test(input) ||
				DM_REG.test(input) ||
				DMS_REG_NO_SPACES_LON.test(input)){
				return true;
			}

		
		return false;
	}
	
	function TestCoordinate(input){
		var parts = input.split(";");
		if(parts.length == 2){
			return TestLat(parts[0]) && TestLon(parts[1]);
		}else if(parts.length == 1){
			return TestLat(parts[0]);
		}else{
			return false;
		}
	}
	
	return{
		stringToLatLon: StringToLatLon,
		testCoordinate: TestCoordinate,
		testLat: TestLat,
		testLon: TestLon
	};
})();
