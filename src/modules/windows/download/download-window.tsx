import 'src/modules/windows/download/download-window.css';

import * as React from 'react';
import * as classnames from 'classnames';

import WindowComponent, { WindowProps } from "src/shared/components/window/window";
import ConfigurationUtil from 'src/utils/configuration-utils';
import Form from 'src/shared/components/Form';
import LabeledSelectInput from 'src/shared/components/LabeledSelectInput';
import RadioInput from 'src/shared/components/RadioInput';
import autobind from 'autobind-decorator';
import ProductInterface from "src/interfaces/product-interface";
import Loader from 'src/shared/components/Loader';

interface Props extends WindowProps {
    onSave: (promise: Promise<string>) => void;
    geoJsons: string[];
}
interface State {
    generationType: string;
    saveFormat: string;
    isLoading: boolean;
}

const generationTypes = ['ACCURACY', 'FAST'];
const saveFormats = ['SHAPEFILE', 'KMZ'];
const ACCURATE_TITLE = 'Every layer point will be estimated with image to ground calls';
const FAST_TITLE = `For layers with more than 4 points, a bounding box will be estimated with
    image to ground calls and all points will be interpolated`;

const formatOptions = saveFormats.map((format, i) =>
    <option value={format} key={i}>{format}</option>
);

@autobind
export default class DownloadWindow extends React.Component < Props, State > {
    constructor(props) {
        super(props);

        this.state = {
            generationType: generationTypes[0],
            saveFormat: saveFormats[0],
            isLoading: false
        };
    }

    public render() {

        const classes = {
            waitWindow: classnames('save_graphics_window__wait_window', this.state.isLoading ? '' : 'save_graphics_window__hidden')
        };

        const colProps = {
            labelCol: { lg: 4 },
            inputCol: { lg: 8 }
        };

        return (
            <WindowComponent
                title="GETM Download"
                modal={true}
                center={true}
                acceptBtnText="Download"
                footerContent={this.state.isLoading ? <Loader className='download-loader'/> : null}
                handleAccept={() => {
                    this.handleSaveGraphics();
                }}
                {...this.props as WindowProps}
            >
                <Form>
                    <LabeledSelectInput
                        label="Format"
                        value={this.state.saveFormat}
                        options={formatOptions}
                        onChange={this.handleSaveFormatChange}
                        {...colProps}
                    />
                    <RadioInput
                        hintText={ACCURATE_TITLE}
                        checked={this.state.generationType === generationTypes[0]}
                        label={generationTypes[0]}
                        onChange={() => {
                            this.handleGenerationTypeChange(generationTypes[0]);
                        }}
                    />
                    <RadioInput
                        hintText={FAST_TITLE}
                        checked={this.state.generationType === generationTypes[1]}
                        label={generationTypes[1]}
                        onChange={() => {
                            this.handleGenerationTypeChange(generationTypes[1]);
                        }}
                    />
                </Form>
            </WindowComponent>
        );
    }

    private handleGenerationTypeChange(type) {
        const generationType = type;
        this.setState({...this.state, generationType});
    }

    private handleSaveFormatChange(e) {
        const saveFormat = e.target.value;
        this.setState({...this.state, saveFormat});
    }

    private handleSaveGraphics() {
        const args = {
            imageName: null,
            sensor: null,
            geoJsons: this.props.geoJsons,
            generationType: this.state.generationType,
            saveFormat: this.state.saveFormat
        };

        this.props.onSave(ProductInterface.saveShapes(args));
        this.props.onClose();
    }
}
