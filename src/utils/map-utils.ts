export default class MapUtils {

    public static getCoordinateFormat(digits: number) {
        return (function(coord: [number, number]) {
            coord = this.normalizeCoord(coord);
            var swappedCoord = [coord[1], coord[0]] as [number, number];
            return "[" + ol.coordinate.toStringXY(swappedCoord, digits) + "]	" + ol.coordinate.toStringHDMS(coord);
        }.bind(this));
    }

    public static normalizeCoord(coord) {
        // Lon is the only one that wraps.
        var revs = Math.floor(Math.abs(coord[0]) / 360);
        
        // Shift lon to range (-360, 360).
        if (coord[0] > 0) {
            coord[0] = coord[0] - revs * 360;
        } else {
            coord[0] = coord[0] + revs * 360;
        }
    
        if (coord[0] > 180) {
            coord[0] = -180 + (coord[0] - 180);
        } else if (coord[0] < -180) {
            coord[0] = 180 + (coord[0] + 180);
        }
    
        return coord;
    }
}