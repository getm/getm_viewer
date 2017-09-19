import ConfigurationUtil from "src/utils/configuration-utils";

export class GETMFeature {
    public analyst: string;
    public benumber: string;
    public c_date: string;
    public c_method: string;
    public c_pvchar: string;
    public c_reason: string;
    public catcode: string;
    public ce_h: string;
    public ce_l: string;
    public ce_w: string;
    public chng_req: string;
    public circ_er: string;
    public class: string;
    public class_by: string;
    public conf_lvl: string;
    public control: string;
    public country: string;
    public d_state: string;
    public decl_on: string;
    public doi: string;
    public drv_from: string;
    public icod: string;
    public label: string;
    public lin_er: string;
    public notional: string;
    public osuffix: string;
    public out_ty: string;
    public producer: string;
    public qc: string;
    public release: string;
    public shape: ol.geom.Geometry;
    public source: string;
    public tgt_coor: string;
    public tgt_name: string;
    public tot: string;

    constructor() {
        this.analyst = '';
        this.benumber = '';
        this.c_date = '';
        this.c_method = '';
        this.c_pvchar = '';
        this.c_reason = '';
        this.catcode = '';
        this.ce_h = '';
        this.ce_l = '';
        this.ce_w = '';
        this.chng_req = '';
        this.circ_er = '';
        this.class = '';
        this.class_by = '';
        this.conf_lvl = '';
        this.control = '';
        this.country = '';
        this.d_state = '';
        this.decl_on = '';
        this.doi = '';
        this.drv_from = '';
        this.icod = '';
        this.label = '';
        this.lin_er = '';
        this.notional = '';
        this.osuffix = '';
        this.out_ty = '';
        this.producer = '';
        this.qc = '';
        this.release = '';
        this.shape = {} as ol.geom.Geometry;
        this.source = '';
        this.tgt_coor = '';
        this.tgt_name = '';
        this.tot = '';
    }
}

export enum FeatureState {
    CREATE,
    UPDATE
}

const GETMEvents = {
    FEATURE_CHANGE: 'feature-change',
    FEATURE_STATE_CHANGE: 'feature-state-change'
};

export {GETMEvents};

interface GETMListeners {
    [index: string]: any;
}

export default class GETMHandler {
    public listeners: GETMListeners;
    private currentFeature: GETMFeature;
    private currentFeatureState: FeatureState;

    constructor() {
        this.listeners = {};
        this.currentFeatureState = FeatureState.CREATE;

        Object.keys(GETMEvents).forEach(event => {
            const arrName = GETMEvents[event];
            this.listeners[arrName] = [];
        });
    }

    public setFeature(feature: GETMFeature) {
        this.currentFeature = feature;
        this.fire(GETMEvents.FEATURE_CHANGE, this.currentFeature);
    }

    public setFeatureState(featureState: FeatureState) {
        this.currentFeatureState = featureState;
        this.fire(GETMEvents.FEATURE_STATE_CHANGE, this.currentFeatureState);
    }

    public getFeature() {
        return this.currentFeature;
    }

    public getFeatureState(): FeatureState {
        return this.currentFeatureState;
    }

    public createNewFeature(geom: ol.geom.Geometry) {
        // Get default properties.
        let data = ConfigurationUtil.getFeatureMetadataRequirements().map((group) => {return group.data});
        let flat = [].concat.apply([], data);
        let feature = flat.reduce((result, next) => {
            result[next.val] = next.example;
            return result;
        }, {}) as GETMFeature;

        // Set geometry
        feature.shape = geom;
        this.currentFeature = feature;
        this.fire(GETMEvents.FEATURE_CHANGE, this.currentFeature);
    }

    public registerListener(type, callback) {
        // Make sure listener type exists
        if(!this.listeners[type]) {
            return;
        }

        // Check for duplicate
        this.listeners[type].forEach(listener => {
            if(listener.callback === callback) {
                return; // Listener already exists
            }
        });
        
        this.listeners[type].push({callback});
    }

    private fire(type, payload?) {
        if(!this.listeners[type]) {
            return;
        }

        this.listeners[type].forEach(listener => {
            listener.callback(payload);
        });
    }
}