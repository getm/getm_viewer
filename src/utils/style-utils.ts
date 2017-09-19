interface LayerStyle {
    color: string,
    width: number,
    dashed: boolean,
    labelKey: string
}

const StyleUtils = {
    getStyle: function(this: LayerStyle, feature: ol.Feature, resolution: number) {
        if(!this.dashed) {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: this.color,
                    width: this.width,
                    lineCap: 'butt'
                })
            });
        } else {
            let border = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(0,0,0)',
                    width: this.width * 1.5,
                }),
            });
            let white = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgb(255,255,255)',
                    width: this.width
                }),
            });
            let color = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: this.color,
                    width: this.width,
                    lineDash: [10, 10],
                    lineCap: 'butt'
                }),
                text: new ol.style.Text({
                    fill: new ol.style.Fill({color: 'rgb(0,0,0)'}),
                    stroke: new ol.style.Stroke({color: 'rgb(255,255,255)', width: 3}),
                    text: feature.get(this.labelKey),
                    font: '12px Helvetica'
                })
            });
            return [border, white, color]
        }
    }
}

export default StyleUtils;