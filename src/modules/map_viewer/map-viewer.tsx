import './map-viewer.css';

import * as React from 'react';
import MapViewerInterface from "src/modules/map_viewer/map-viewer-interface";
import LayersWindow from "src/modules/windows/layers/layers-window";
import { Events } from "src/modules/map_viewer/event-listeners";
import DownloadWindow from "src/modules/windows/download/download-window";
import WaitWindow from "src/modules/windows/wait/wait-window";
import ConfigurationUtil from "src/utils/configuration-utils";
import autobind from 'autobind-decorator';

interface Props {
    mapViewerInterface: MapViewerInterface;
    viewerId: string;
    refCallback: (viewerElement: HTMLElement) => void;
    onInit: () => void;
}

interface State {
    mapAttached: boolean;
    selectedGeoJsons: string[];
    showLayersWindow: boolean;
    showDownloadWindow: boolean;
    showWaitWindow: boolean;
}

@autobind
export default class MapViewer extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            selectedGeoJsons: [],
            showDownloadWindow: false,
            showLayersWindow: false,
            showWaitWindow: false,
            mapAttached: false
        }
    }

    public componentDidMount() {
        this.props.mapViewerInterface.attachInterface();
        this.setState({mapAttached: true});
        this.props.mapViewerInterface.registerListener(Events.LAYERS_TOGGLE, this.toggleLayersWindow.bind(this));
        this.props.mapViewerInterface.registerListener(Events.DOWNLOAD_TOGGLE, this.toggleDownloadWindow.bind(this));
        this.props.onInit();
    }

    render() {
        const style = {width: '100%', height: '100%', backgroundColor: 'dimgray'};

        const windows = [];
        if(this.state.mapAttached) {
            windows.push(<LayersWindow visible={this.state.showLayersWindow} key={'layers'}
                onClose={() => this.setState({ showLayersWindow: false })} mapLayers={this.props.mapViewerInterface.getMapLayers()} featureLayers={this.props.mapViewerInterface.getFeatureLayers()}/>);
            windows.push(<DownloadWindow visible={this.state.showDownloadWindow} key={'download'} onSave={(promise) => this.handleSave(promise)} onClose={this.handleClose} geoJsons={this.state.selectedGeoJsons}/>);
            windows.push(<WaitWindow visible={this.state.showWaitWindow} key={'wait'}>Downloading features...</WaitWindow>);
        }

        return (
            <div style={{height: "100%"}}>
                <div id={this.props.viewerId} ref={viewerElement => this.props.refCallback(viewerElement)} style={style}/>
                {windows}
            </div>
        );
    }

    private toggleLayersWindow() {
        const showLayersWindow = !this.state.showLayersWindow;
        this.setState({showLayersWindow});
    }

    private toggleDownloadWindow(geoJsons: string[]) {
        const showDownloadWindow = !this.state.showDownloadWindow;
        this.setState({showDownloadWindow, selectedGeoJsons: geoJsons});
    }

    private handleSave(promise: Promise<string>) {
        this.setState({showWaitWindow: true});
        promise.then(url => {
            this.setState({showWaitWindow: false});
            window.open(ConfigurationUtil.getBaseUrl() + '/product' + url, '_blank');
        }).catch(e => {
            this.setState({showWaitWindow: false});
        });
    }

    private handleClose() {
        this.setState({ showDownloadWindow: false });
        this.props.mapViewerInterface.clearFeatureLayer();
    }
};

