import './settings-bar.scss';

import * as React from 'react';
import * as classnames from 'classnames';

import ConfigurationUtil from 'src/utils/configuration-utils';
import IconButton from 'src/shared/components/IconButton';
import Theme from 'src/shared/types/Theme';
import { themed } from 'react-themable-hoc';

interface Props {
    vertical?: boolean;
    handleWorkflowArea: () => void;
}

interface ThemeProps {
    classNames: {
        theme: string;
    };
}

class SettingsBar extends React.Component<Props & ThemeProps, {}> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    public render() {
        const classes = classnames(this.props.vertical ? 'settings-bar_vertical' : 'settings-bar', 
            this.props.classNames.theme);
            
        return (
            <div className={classes}>

                <div className={'settings-bar__' + (this.props.vertical ? 'section' : 'right') }>
                    <IconButton
                        title="Toggle Workflow Area"
                        onClick={this.props.handleWorkflowArea}
                        iconClass={this.props.vertical ? 'icon-angle-double-left' : 'icon-angle-double-right'}
                    />
                </div>
            </div>
        );
    }
}

export default themed<Props, ThemeProps>(({ colors }: Theme) => ({
    theme: {
        color: colors.font,
        borderColor: colors.border,
        backgroundColor: colors.form,
    }
}))(SettingsBar);
