import './layer-switch.css'

import * as React from 'react';
import * as classnames from 'classnames';

import { Column, createColClasses } from "src/shared/types/Column";
import Switch from "src/shared/components/Switch/Switch";
import { Legend, LegendProps } from "src/modules/windows/layers/legend";

interface Props {
    title: string;
    checked?: boolean;
    onChange?: (title: string, visible: boolean) => void;
    legendProps?: LegendProps;
    labelCol?: Column;
    inputCol?: Column;
    disabled?: boolean;
}

interface State {
    checked: boolean;
}

export default class LayerSwitch extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            checked: props.checked
        };
    }

    public componentWillReceiveProps(nextProps: Props) {
        if(this.state.checked !== nextProps.checked) {
            this.setState({checked: nextProps.checked});
            this.props.onChange(this.props.title, nextProps.checked);
        }
    }

    render() {
        const classes = {
            label: classnames(createColClasses({ lg: 6 }), 'no-pad-right'),
            innerLabel: classnames('col-lg-12', 'control-label'),
            input: createColClasses({ lg: 4 }),
            legend: createColClasses({ lg: 1 })
        };

        const legend = this.props.legendProps ? (
            <Legend dashed={this.props.legendProps.dashed} color={this.props.legendProps.color}></Legend>
            ) : null;
    
        return (
            <div className="form-group form-group-sm">
                <div className={classes.input}>
                    <Switch checked={this.state.checked} onChange={this.handleLayerToggle.bind(this)} />
                </div>
                <div className={classes.legend}>
                    {legend}
                </div>
                <div className={classes.label}>
                    <label className={classes.innerLabel}>{this.props.title}</label>
                </div>
            </div>
        );
    }

    private handleLayerToggle() {
        const checked = !this.state.checked;
        this.setState({checked});
        this.props.onChange(this.props.title, checked);
    }
}