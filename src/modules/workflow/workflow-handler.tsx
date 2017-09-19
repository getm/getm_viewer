import * as React from 'react';

import WorkflowSection from 'src/modules/workflow/workflow-section';
import GETMHandler, { FeatureState, GETMEvents } from "src/modules/getm/getm-handler";
import { Button } from "src/shared/components/Button/Button";
import Collapse, { Panel } from 'src/shared/components/Collapse';

interface Props {
    groups: string[];
    getmHandler: GETMHandler;
    /** Whether the workflow area should be collapsed (only shows section abbreviations) */
    collapsed?: boolean;
}

interface State {
    buttonText: string;
}

export default class WorkflowHandler extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            buttonText: 'Submit'
        };

        this.props.getmHandler.registerListener(GETMEvents.FEATURE_STATE_CHANGE, (featureState) => this.handleFeatureStateChange(featureState));
    }

    render() {
        const header = this.getSectionHeader();
        return (
            <div 
                className={'workflow_area'}
                style={{display: this.props.collapsed ? 'none' : 'block'}}
            >
                <Collapse
                    className="workflow_collapse"
                    accordion
                    activeKey={'0'}
                    onChange={i => {}}
                >
                    <Panel
                        className={'workflow_panel workflow_panel--open'}
                        isActive={true}
                        arrowOpen={<i className="icon-angle-down section-header__arrow"/>}
                        arrowClosed={<i className="icon-angle-up section-header__arrow"/>}
                        hidden={false}
                        header={header}
                        key={'0'}
                    >
                        <WorkflowSection getmHandler={this.props.getmHandler} groups={this.props.groups}></WorkflowSection>
                    </Panel>
                </Collapse>
            </div>
        );
    }

    private handleFeatureStateChange(featureState: FeatureState) {
        const buttonText = (featureState === FeatureState.CREATE ? 'Submit' : 'Update');
        this.setState({buttonText});
    }
    
    private getSectionHeader() {
        let buttons;
        if(this.props.groups.find((e) => {return e === 'getm-admin';})) {
            buttons = [{onClick: () => {}, buttonText: this.state.buttonText}];
        } else {
            buttons = [];
        }

        return <SectionHeader title='Feature Data' buttons={buttons} visible={true}/>
    }
};

const SectionHeader = (props) => {
    const style = props.visible ? {display: 'inline-block'} : {display: 'none'};
    const clickWrapper = (e, onClick) => {
        onClick(e);
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };

    const buttons = props.buttons && props.buttons.map(button =>
        <Button key={button.buttonText} classNames={{button: "section_header_button"}}
            style={style} onClick={(e) => clickWrapper(e, button.onClick)}>
            {button.buttonText}
        </Button>
    );

    return (
        <span>
            {props.title}
            {props.buttons &&
                <div className="section_header_buttons">
                    {buttons}
                </div>
            }
        </span>
    );
};