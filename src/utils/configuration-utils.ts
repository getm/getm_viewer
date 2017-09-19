import { MapSource } from "src/shared/interfaces/OpenLayers/OpenLayersInterface";

declare const CGSWeb_Map;

export default class ConfigurationUtil {

    public static getTitle(): string {
        return tryGet('title');
    }

    public static getVersion(): string {
        return tryGet('version');
    }

    public static getSponsorImage(): string {
        return tryGet('sponsorImage');
    }

    public static getBannerClassification(): string {
        return tryGet('bannerClassification');
    }

    public static getBannerColor(): string {
        return tryGet('bannerColor');
    }

    public static getDefaultProjection(): string {
        return tryGet('defaultProjection');
    }

    public static getDefaultCenter(): [number, number] {
        return tryGet('defaultCenter');
    }

    public static getDefaultZoom(): number {
        return tryGet('defaultZoom');
    }

    public static getMapConfigs(): MapSource[] {
        return tryGet('mapConfigs');
    }

    public static getWmsLayerConfig(): any {
        return tryGet('wmsLayerConfig');
    }

    public static getLayerConfigs(): any {
        return tryGet('layerConfigs');
    }

    public static getFeatureMetadataRequirements(): any {
        return tryGet('featureMetadataRequirements');
    }

    public static getNavigation(): any {
        return tryGet('navigation');
    }

    public static getAuthAddress(): any {
        return tryGet('authService');
    }

    public static getDatabaseAddress() {
        return tryGet('dbService');
    }

    public static getBeUrl() {
        return tryGet('beUrl');
    }

    public static getMdalUrl() {
        return tryGet('mdalUrl');
    }

    public static getParseMdalUrl() {
        return tryGet('parseMdalUrl');
    }

    public static getValidText(): string {
        return tryGet('validText');
    }
}

function tryGet(property) {
    if(typeof CGSWeb_Map === 'undefined') {
        console.warn('No CGSWeb_Map configuration found.');
    }
    if(CGSWeb_Map[property] === undefined) {
        console.warn('No CGSWeb_Map configuration property for \"' + property + '\"');
    }

    return CGSWeb_Map[property];
}