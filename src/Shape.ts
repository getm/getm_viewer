// create shape object with links to specified feature, the layer the feature exists on, 
// properties, and objectID in the database
export var Shape = function(feature, layer, properties={}, objectID=-1){
    this.feature = feature;
    this.layer = layer; 
    this.properties = properties;
    this.objectID = objectID; 

    this.getFeature = function(){
        return this.feature;
    }
    this.setFeature = function(feature) {
        this.feature = feature;
    }
    this.getLayer = function(){
        return this.layer;
    }
    this.setLayer = function(layer) {
        this.layer = layer;
    }
    this.getProperties = function(){
        return this.properties;
    }
    this.setProperties = function(properties) {
        this.properties = properties;
    }
    this.getProperty = function(property){
        if(this.properties == null || this.properties[property] == null)
            return null
        return this.properties[property]['val'];
    }
    this.getObjectID = function(){
        return this.objectID;
    }
    this.setObjectID = function(objectID) {
        this.objectID = objectID;
    }
}