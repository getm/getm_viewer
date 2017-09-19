import './map-viewer.css';

import * as React from 'react';
import MapViewerInterface from "src/modules/map_viewer/map-viewer-interface";
import LayersWindow from "src/modules/windows/layers/layers-window";
import { Events } from "src/modules/map_viewer/event-listeners";

interface Props {
    mapViewerInterface: MapViewerInterface;
    viewerId: string;
    refCallback: (viewerElement: HTMLElement) => void;
    onInit: () => void;
}

interface State {
    mapAttached: boolean;
    showLayersWindow: boolean;
}

export default class MapViewer extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            showLayersWindow: false,
            mapAttached: false
        }
    }

    public componentDidMount() {
        this.props.mapViewerInterface.attachInterface();
        this.setState({mapAttached: true});
        this.props.mapViewerInterface.registerListener(Events.LAYERS_TOGGLE, this.toggleLayersWindow.bind(this));
        this.props.onInit();
    }

    render() {
        const style = {width: '100%', height: '100%', backgroundColor: 'dimgray'};

        const windows = [];
        if(this.state.mapAttached) {
            windows.push(<LayersWindow visible={this.state.showLayersWindow} key={'settings'}
                onClose={() => this.setState({ showLayersWindow: false })} mapLayers={this.props.mapViewerInterface.getMapLayers()} featureLayers={this.props.mapViewerInterface.getFeatureLayers()}/>);
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
};

