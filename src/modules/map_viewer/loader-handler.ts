import LoaderControl from 'src/shared/interfaces/OpenLayers/plugins/LoaderControl/LoaderControl';

export default class LoaderHandler {
    private count: number;
    private loaderControl: LoaderControl;
    private timeout: number;

    constructor(loaderControl: LoaderControl) {
        this.loaderControl = loaderControl;
        this.count = 0;
        this.timeout = null;
    }

    public taskStart(smooth: boolean = false) {
        this.changed(this.count + 1, smooth);
    }

    public taskEnd(smooth: boolean = false) {
        this.changed(this.count - 1, smooth);
    }

    private changed(newCount: number, smooth: boolean) {
        if(this.count == 0 && newCount == 1) {
            this.loaderControl.show();
        } else if( this.count == 1 && newCount == 0) {
            if(smooth) {
                if(this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(this.loaderControl.hide.bind(this.loaderControl), 100);
            } else {
                this.loaderControl.hide();
            }
        }
        this.count = newCount;
    }
}