/*
 * Code here is ported from common coord MGRS.java. (common coord)
 * 
 * Requires: geo.js
 * 			 utm.js
 */


GEO.namespace("GEO.mgrs");

GEO.mgrs = (function() {
	var utm = GEO.utm, // Dependency.
		
		utmrowperiod = 20,
		maxutmSrow = 100,
		
		easting_table = [ ["I", "I", "I", "I", "I", "I", "I", "I", "I"],
				  ["I", "A", "B", "C", "D", "E", "F", "G", "H"],
				  ["I", "J", "K", "L", "M", "N", "P", "Q", "R"],
				  ["I", "S", "T", "U", "V", "W", "X", "Y", "Z"],
				  ["I", "A", "B", "C", "D", "E", "F", "G", "H"],
				  ["I", "J", "K", "L", "M", "N", "P", "Q", "R"],
				  ["I", "S", "T", "U", "V", "W", "X", "Y", "Z"]
				],
		northing_table = [ ["F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V","A","B","C","D","E"],
				   ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V"]],
		
		zone_table = ["C","D","E","F","G","H","J","K","L","M",
				 "N","P","Q","R","S","T","U","V","W","X"];
	
		/*
		 * 	Method: computeSet
		 * 		Computes the proper set for the given zone
		 */
		function computeSet(zone){
			var set = zone % 6;
			if(set == 0){
				set = 6;
			}
			return set;
		}
		

		function UTMRow(iband, icol, irow) {
			// Input is MGRS (periodic) row index and output is true row index.  Band
			// index is in [-10, 10) (as returned by LatitudeBand).  Column index
			// origin is easting = 100km.  Returns maxutmSrow if irow and iband are
			// incompatible.  Row index origin is equator.
	
			// Estimate center row number for latitude band
			// 90 deg = 100 tiles; 1 band = 8 deg = 100*8/90 tiles
			var c = 100 * (8 * iband + 4) / 90.0, northp = iband >= 0, mod = 0, minrow, maxrow, baserow, sband, srow, scol;
	
			if (northp) {
				mod = 1;
			}
	
			minrow = iband > -10 ? (Math.floor(c - 4.3 - 0.1 * mod)) : -90;
			maxrow = iband < 9 ? (Math.floor(c + 4.4 - 0.1 * mod)) : 94;
			baserow = (minrow + maxrow) / 2 - utmrowperiod / 2;
			// Add maxutmSrow = 5 * utmrowperiod to ensure operand is positive
			irow = (irow - baserow + maxutmSrow) % utmrowperiod + baserow;
			if (irow < minrow || irow > maxrow) {
				// Northing = 71*100km and 80*100km intersect band boundaries
				// The following deals with these special cases.
				// Fold [-10,-1] -> [9,0]
				sband = iband >= 0 ? iband : -iband - 1,
				// Fold [-90,-1] -> [89,0]
				srow = irow >= 0 ? irow : -irow - 1,
				// Fold [4,7] -> [3,0]
				scol = icol < 4 ? icol : -icol + 7;
				if (!((srow == 70 && sband == 8 && scol >= 2)
						|| (srow == 71 && sband == 7 && scol <= 2)
						|| (srow == 79 && sband == 9 && scol >= 1) || (srow == 80
						&& sband == 8 && scol <= 1))) {
					irow = maxutmSrow;
				}
			}
			return irow;
		}
		
		function LatLonToMGRS(lat, lon){
			var utmCoord = utm.latLonToUTMXY(lat, lon),
			
				// Figure out which set we belong to according to our
				// UTM zone
				set = computeSet(utmCoord.zone),
				southhemisphere = utmCoord.southhemisphere,
				zone = utmCoord.zone,
				zoneCode = utmCoord.zoneCode,
			
				// Compute easting
				eastingLeader = Math.floor(utmCoord.easting / 100000),
				easting = utmCoord.easting - eastingLeader * 100000.0,
				tie,
				northingLeader,
				northing;
			
			eastingLeader = eastingLeader % 8;
			if(eastingLeader == 0)
			{
				eastingLeader = 8;
			}
			tie = easting_table[set][eastingLeader];
			
			// Compute northing
			northingLeader = Math.floor(utmCoord.northing / 100000);
			northing = utmCoord.northing - northingLeader * 100000.0;
			northingLeader = northingLeader % 20;
			tie = tie + northing_table[set%2][northingLeader];
			
			return {
				easting: easting,
				northing: northing,
				zone: zone,
				zoneCode: zoneCode,
				tie: tie,
				southhemisphere: southhemisphere
			};
		}
		
		function MGRSToLatLon(easting_arg, northing_arg, zone_arg, 
							zoneCode_arg, tie_arg, southHemisphere_arg){
			var zone = zone_arg,
				zoneCode = zoneCode_arg,
				southHemisphere = southHemisphere_arg,
			
				// Compute easting.
				set = computeSet(zone),
				icol = -1,
				iband = -1,
				irow = -1,
				northing,
				easting;
				
			for(var i= 1; i < easting_table[set].length; i++)
			{
				if(tie_arg.substr(0,1) == easting_table[set][i])
				{
					icol = i;
					easting = easting_arg + i * 100000.0;
					break;
				}
			}
			if(icol == -1){
				return null;
			}
			
			icol = icol - 1;

			for(var i = 0; i < zone_table.length; i++){
				if(zoneCode_arg == zone_table[i]){
					iband = i;
				}
			}
			
			if(iband == -1){
				return null;
			}
			
			iband = iband - 10;
			
			// Compute Northing
			for(var i= 0; i < northing_table[set%2].length; i++)
			{
				if(tie_arg.substr(1,2) == northing_table[set%2][i])
				{
					irow = i;
					break;
				}
			}
			
			if(irow == -1){
				return null;
			}
			
			// This function converts the mgrs row to a utm one. I couldn't find a
			// good reference for what it's doing, but my best guess is that it is
			// accounting for the overlap that is possable beween grids. The 
			// algorithm itself comes from GeographicLib's MGRS class. 
			// http://geographiclib.sourceforge.net/
			irow = UTMRow(iband, icol, irow);
			
			if(iband < 0){
				irow = irow + 100;
			}
			
			northing = northing_arg + irow * 100000;
			
			
			return utm.UTMXYToLatLon(easting, northing, zone, southHemisphere);
		} // end toLatLon
		
	
	return{
		latLonToMGRS: LatLonToMGRS,
		MGRSToLatLon: MGRSToLatLon
	};
})();