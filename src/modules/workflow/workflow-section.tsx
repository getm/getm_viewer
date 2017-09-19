import * as React from 'react';

import ConfigurationUtil from "src/utils/configuration-utils";
import LabeledTextInput from 'src/shared/components/LabeledTextInput/LabeledTextInput';
import LabeledSelectInput from 'src/shared/components/LabeledSelectInput/LabeledSelectInput';
import CollapsableSection from 'src/shared/components/CollapsableSection/CollapsableSection';
import GETMHandler, { GETMFeature, GETMEvents } from "src/modules/getm/getm-handler";

interface Props {
    getmHandler: GETMHandler;
    groups: string[];
}

interface State {
    feature: GETMFeature;
}

export default class WorkflowSection extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            feature: new GETMFeature()
        }

        this.props.getmHandler.registerListener(GETMEvents.FEATURE_CHANGE, (feature) => this.handleFeatureChange(feature));
    }

    render() {
        const items = this.getItems(!this.props.groups.find((e) => {return e === 'getm-admin';}));
        return (
            <div className="form-horizontal">
                <div style={{margin: '5px 0px'}}>
                    {items}
                </div>
            </div>
        );
    }

    private getItems(readOnly: boolean) {
        return ConfigurationUtil.getFeatureMetadataRequirements().map((group, i) => {
            const inputs = group.data.map((requirements, i) => {
                if(requirements.name) {
                    if(requirements.options) {
                        return <LabeledSelectInput size='sm' id={requirements.val} label={requirements.name} labelCol={{lg: 3}} inputCol={{lg: 8}} disabled={readOnly} options={requirements.options} value={this.state.feature[requirements.val]} onChange={(e) => {this.handleChange(e)}} key={i}></LabeledSelectInput>;
                    } else {
                        return <LabeledTextInput size='sm' id={requirements.val} label={requirements.name} labelCol={{lg: 3}} inputCol={{lg: 8}} readOnly value={this.state.feature[requirements.val]} onChange={(e)=>{this.handleChange(e)}} key={i}></LabeledTextInput>;
                    }
                }
            });
            return (
                <CollapsableSection title={group.name} initOpen={i === 0} key={i}>
                    {inputs}
                </CollapsableSection>
            );
        });
    }

    private handleChange(event) {
        /*let prevFeature = this.props.getmHandler.getFeature();
        prevFeature[event.target.id] = event.target.value;
        this.props.getmHandler.setFeature(prevFeature);
        */
        const feature = this.state.feature;
        feature[event.target.id] = event.target.value;
        this.setState({feature});
    }

    private handleFeatureChange(feature: GETMFeature) {
        this.setState({feature});
    }
};