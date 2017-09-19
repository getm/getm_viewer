import * as React from 'react';
import WindowComponent from "src/shared/components/window/window";
import { LabeledSwitch } from "src/shared/components/LabeledSwitch/LabeledSwitch";
import LayerSwitch from "src/modules/windows/layers/layer-switch";
import MapViewerInterface, { FeatureLayer, MapLayer } from "src/modules/map_viewer/map-viewer-interface";
import LocalStorageUtils from "src/utils/local-storage-utils";

interface Props {
    onClose: () => void;
    visible: boolean;
    mapLayers: MapLayer[];
    featureLayers: FeatureLayer[];

}

interface State {
    // The selected map layer (only one).
    selectedMapLayerIdx: number
}

export default class LayersWindow extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            selectedMapLayerIdx: props.mapLayers.findIndex((layer: MapLayer) => {
                return layer.getVisible();
            })
        };
    }

    render() {
        
        let baseLayers = this.getMapLayers();
        let featureLayers = this.getFeatureLayers();

        return (
            <WindowComponent
                title={'Layers'}
                width={'275px'}
                height={'auto'}
                modal={false}
                center={false}
                visible={this.props.visible}
                onClose={this.props.onClose.bind(this)}
            >
                <div className={'form-horizontal layers-window-content'}>
                    <h5><strong>Base Maps</strong></h5>
                    {baseLayers}
                    <h5><strong>Overlays</strong></h5>
                    {featureLayers}
                </div>
            </WindowComponent>
        );
    }

    private getMapLayers() {
        return this.props.mapLayers.map(function(mapLayer, i) {
            return (<LayerSwitch title={mapLayer.getTitle()} checked={mapLayer.getVisible() && this.state.selectedMapLayerIdx === i} onChange={this.handleMapLayerToggle.bind(this)} key={i}></LayerSwitch>);
        }.bind(this));
    }

    private getFeatureLayers() {
        return this.props.featureLayers.map((featureLayer, i) => {
            return (<LayerSwitch title={featureLayer.getTitle()} checked={featureLayer.getVisible()} onChange={this.handleFeatureLayerToggle.bind(this)} legendProps={{dashed: featureLayer.vector.config.style.dashed, color: featureLayer.vector.config.style.color}} key={i}></LayerSwitch>);
        });
    }

    private handleMapLayerToggle(title: string, visible: boolean) {
        let layer = this.props.mapLayers.find((mapLayer) => {
            return mapLayer.getTitle() === title;
        });
        layer.setVisible(visible);

        let toggleIdx = this.props.mapLayers.findIndex((layer: MapLayer) => {return layer.getTitle() === title;});
        if(visible) {
            // Only one layer can be visible at once.
            this.setState({selectedMapLayerIdx: toggleIdx});
        } else {
            // At least one layer must be visible.
            let toggleOnIdx = (toggleIdx + 1) % this.props.mapLayers.length;
            this.props.mapLayers[toggleOnIdx].setVisible(true);
            this.setState({selectedMapLayerIdx: toggleOnIdx});
        }

        // Save state to local storage.
        LocalStorageUtils.setLayerState(this.props.mapLayers, LocalStorageUtils.MAP_LAYER_STATE);
    }

    private handleFeatureLayerToggle(title: string, visible: boolean) {
        let layer = this.props.featureLayers.find((mapLayer) => {
            return mapLayer.getTitle() === title;
        });

        if(!visible) {
            layer.setVisible(false);
        } else {
            // Compute index to put layer at in WMS "LAYERS" query parameter.
            let index = 0;
            for(let featureLayer of this.props.featureLayers) {
                if(featureLayer.getVisible()) {
                    index++;
                }
                if(featureLayer.getTitle() === title) {
                    break;
                }
            };
            layer.setVisible(true, index);
        }

        // Save state to local storage.
        LocalStorageUtils.setLayerState(this.props.featureLayers, LocalStorageUtils.FEATURE_LAYER_STATE);
    }


}