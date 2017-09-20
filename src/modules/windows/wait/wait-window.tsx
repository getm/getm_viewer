import * as React from 'react';
import Loader from 'src/shared/components/Loader';
import WindowComponent from "src/shared/components/window/window";

interface Props {
    title?: string;
    modal?: boolean;
    xOffset?: number;
    yOffset?: number;
    visible?: boolean;
    style?: React.CSSProperties;
}

const WaitWindow: React.SFC<Props> = (props: Props) => {
    const windowProps = {
        ...props,
        width: 'auto',
        height: '10px',
        center: !(props.xOffset || props.yOffset),
        closeOnEscape: false,
        showHeader: false
    };

    return (
        <WindowComponent {...windowProps}>
            <div className="waitwindow__container">
                <Loader className="waitwindow__img"/>
                <span className="waitwindow__text">{(props as any).children}</span>
            </div>
        </WindowComponent>
    );
};

export default WaitWindow;
