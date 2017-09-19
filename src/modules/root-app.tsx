import * as React from 'react';
import { themed } from 'react-themable-hoc';

import { Themes } from "src/modules/theme/themes";
import MapViewer from './map_viewer/map-viewer';
import MapViewerInterface from "src/modules/map_viewer/map-viewer-interface";
import ConfigurationUtil from "src/utils/configuration-utils";
import WorkflowHandler from "src/modules/workflow/workflow-handler";
import { Events } from "src/modules/map_viewer/event-listeners";
import GETMHandler, { GETMFeature, FeatureState } from "src/modules/getm/getm-handler";
import SettingsBar from "src/modules/workflow/settings-bar";
import LayersWindow from "src/modules/windows/layers/layers-window";

/* Shared Component Library */
import AppBanner from 'src/shared/components/AppBanner/index';
import ClassificationContainer from 'src/shared/components/ClassificationContainer';
import Theme from 'src/shared/types/Theme';
import SlideOutMenu from "src/shared/components/SlideOutMenu/SlideOutMenu"
import AuthInterface from "src/shared/interfaces/rest/AuthInterface";
import { DatabaseInterface } from "src/interfaces/database-interface";
import ResizeableContainer from "src/shared/components/ResizableContainer/ResizableContainer";
import { ResizablePane } from "src/shared/components/ResizableContainer";

interface Props {

}

interface ThemeProps {
    classNames: {
        theme: string;
        workflowContainer: string;
    };
}

interface State {
    bannerExpanded: boolean;
    workflowAreaExpanded: boolean;
    slideOutOpen: boolean;
    classNames: any;
    buttonTxt: string;
    user: string;
    groups: string[];
}

class RootApp extends React.Component<Props & ThemeProps, State> {

    private getmHandler: GETMHandler;
    private mapViewerInterface: MapViewerInterface;
    private viewerElement: HTMLElement;
    private resizableContainer: ResizeableContainer;
    private shouldUpdateSize: boolean;

    constructor(props) {
        super(props);

        this.state = {
            bannerExpanded: true,
            workflowAreaExpanded: false,
            slideOutOpen: false,
            classNames: this.props.classNames,
            buttonTxt: 'Submit',
            user: '',
            groups: []
        }

        this.mapViewerInterface = new MapViewerInterface();
        this.getmHandler = new GETMHandler();

        this.shouldUpdateSize = false;
    }

    public componentDidMount() {
        AuthInterface.setup(ConfigurationUtil.getAuthAddress());
        AuthInterface.getUsername().then(user => {
            this.setState({user});
        });

        DatabaseInterface.getUserGroups().then(groups => {
            this.setState({groups})
        });
    }

    public componentDidUpdate() {
        if(this.shouldUpdateSize) {
            this.handleResetPaneSizes();
            this.shouldUpdateSize = false;
        }
    }

    render() {
        const imageViewerWidth = this.state.workflowAreaExpanded ? '80%' : '99%';
        const workflowAreaWidth = this.state.workflowAreaExpanded ? '20%' : '1%';

        return (
                <div className = {`getm_container ${this.props.classNames.theme}`}>
                    <ClassificationContainer
                        text={ConfigurationUtil.getBannerClassification()}
                        color={ConfigurationUtil.getBannerColor()}
                    >
                        <AppBanner
                            title={ConfigurationUtil.getTitle()}
                            version={ConfigurationUtil.getVersion()}
                            image={ConfigurationUtil.getSponsorImage()}
                            isExpanded={this.state.bannerExpanded}
                            user={this.state.user}
                            onCollapseToggle={() => this.setState({ bannerExpanded: !this.state.bannerExpanded })}
                            onMenuToggle={() => this.toggleSlideMenu()}
                        >
                            <span
                                style={{textAlign: 'center'}}
                                className="col-lg-12"
                                dangerouslySetInnerHTML={{__html: ConfigurationUtil.getValidText()}}
                            >

                            </span>
                        </AppBanner>
                        <div className="main_container" style={{ top: this.state.bannerExpanded ? '63px' : '30px' }}>
                            <ResizeableContainer debug width="100%" height="100%" alignment="horizontal" id="main"
                                        ref={el => this.resizableContainer = el}
                                        onResize={() => this.handleResize()}
                                    >
                                <ResizablePane width={imageViewerWidth} height="100%">
                                    <MapViewer refCallback={viewerElement => { this.viewerElement = viewerElement; }} mapViewerInterface={this.mapViewerInterface} onInit={() => this.handleMapViewerInit()} viewerId={'map'}></MapViewer>
                                </ResizablePane>
                                <ResizablePane width={workflowAreaWidth} height="100%">
                                    <div className={`workflow_container ${this.props.classNames.workflowContainer}`}>
                                        <WorkflowHandler getmHandler={this.getmHandler} collapsed={!this.state.workflowAreaExpanded} groups={this.state.groups}></WorkflowHandler>
                                        <SettingsBar vertical={!this.state.workflowAreaExpanded} handleWorkflowArea={() => this.handleWorkflowArea()}/>
                                    </div>
                                </ResizablePane>
                            </ResizeableContainer>
                        </div>
                        <SlideOutMenu
                            isOpen={this.state.slideOutOpen}
                            onClose={() => this.toggleSlideMenu()}
                            title={ConfigurationUtil.getTitle()}
                            image={ConfigurationUtil.getSponsorImage()}
                            nav={ConfigurationUtil.getNavigation()}
                        />
                        <div id="portalContainer"></div>
                    </ClassificationContainer>
                </div>
        );
    }

    private handleResize() {
        this.mapViewerInterface.updateSize();
    }

    private handleMapViewerInit() {
        this.mapViewerInterface.registerListener(Events.SELECT, (feature: GETMFeature) => {
            if(feature) {
                this.getmHandler.setFeature(feature);
                this.getmHandler.setFeatureState(FeatureState.UPDATE);
                this.toggleWorkflowArea(true);
            }
        });

        this.mapViewerInterface.registerListener(Events.CREATE, (geom: ol.geom.Geometry) => {
            this.getmHandler.createNewFeature(geom);
            this.getmHandler.setFeatureState(FeatureState.CREATE);
            this.toggleWorkflowArea(true);
        });
    }

    private handleResetPaneSizes() {
        this.resizableContainer.resetSizes();
    }

    private handleWorkflowArea() {
        const toggled = !this.state.workflowAreaExpanded;
        this.toggleWorkflowArea(toggled);
    }

    private toggleWorkflowArea(toggle: boolean) {
        this.shouldUpdateSize = true;
        this.setState({workflowAreaExpanded: toggle});
    }

    private toggleSlideMenu() {
        this.setState({slideOutOpen: !this.state.slideOutOpen});
    }
}

export const ThemedApp = themed<Props & ThemeProps>(({ colors }: Theme) => ({
    theme: {
        color: colors.font,
        borderColor: colors.border,
        backgroundColor: colors.form
    },
    workflowContainer: {
        borderColor: colors.border
    }
}))(RootApp);