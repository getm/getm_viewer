
export var Shape = function(feature, layer, properties, objectID=-1){
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
    this.getObjectID = function(){
        return this.objectID;
    }
    this.setObjectID = function(objectID) {
        this.objectID = objectID;
    }
    
}