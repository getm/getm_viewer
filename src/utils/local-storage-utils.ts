
export default class LocalStorageUtils {
    public static MAP_VIEW_STATE = 'mapViewState';

    public static MAP_LAYER_STATE = 'mapLayerState';

    public static FEATURE_LAYER_STATE = 'featureLayerState';

    public static getState(localStorageKey: string) {
        return JSON.parse(localStorage.getItem(localStorageKey));
    }

    public static setState(state: any, localStorageKey: string) {
        localStorage.setItem(localStorageKey, JSON.stringify(state));
    }

    public static getLayerState(configs: any, localStorageKey: string) {
        let state = JSON.parse(localStorage.getItem(localStorageKey));
        if(state) {
            if(configs.length === state.length) {
                state.forEach((state, i) => {
                    configs[i].visible = state.visible;
                });
            } else {
                localStorage.removeItem(localStorageKey);
            }
        }
        return configs;
    }

    public static setLayerState(configs: any, localStorageKey: string) {
        let state = [];
        configs.forEach((layer) => {
            state.push({visible: layer.getVisible()});
        });
        localStorage.setItem(localStorageKey, JSON.stringify(state));
    }
}