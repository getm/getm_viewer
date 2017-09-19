import * as ol from 'openlayers';

import OpenLayersInterface, { MapSource } from "src/shared/interfaces/OpenLayers/OpenLayersInterface";
import DrawControl from 'src/shared/interfaces/OpenLayers/plugins/DrawControl/DrawControl';
import LoaderControl from 'src/shared/interfaces/OpenLayers/plugins/LoaderControl/LoaderControl';
import ConfigurationUtil from "src/utils/configuration-utils";
import MapUtils from "src/utils/map-utils";
import ButtonControl from 'src/shared/interfaces/OpenLayers/plugins/ButtonControl/ButtonControl';
import { EventListeners, Events } from "src/modules/map_viewer/event-listeners";
import { GETMFeature } from 'src/modules/getm/getm-handler';
import StyleUtils from "src/utils/style-utils";
import LoaderHandler from "src/modules/map_viewer/loader-handler";
import initJumpTo from "src/shared/interfaces/OpenLayers/plugins/JumpTo/JumpTo";
import LocalStorageUtils from "src/utils/local-storage-utils";

interface VectorStyleConfig {
    dashed: boolean;
    color: string;
    width: number;
    labelKey: string;
}

interface VectorConfig {
    hostAddress: string;
    url: string;
    version: string;
    outputFormat: string;
    minResolution: number;
    maxResolution: number;
    name: string;
    style: VectorStyleConfig;
}

interface TileConfig {
    // hostAddress: string;
    layer: string;
    // url: string;
    // version: string;
    // minResolution: number;
    // maxResolution: number;
}

class VectorLayerWrapper {
    public config: VectorConfig;
    public layer: ol.layer.Vector;

    constructor(config: VectorConfig, layer: ol.layer.Vector) {
        this.config = config;
        this.layer = layer;
    }
}

class TileLayerWrapper {
    public config: TileConfig;
    public layer: ol.layer.Tile;

    constructor(config: TileConfig, layer: ol.layer.Tile) {
        this.config = config;
        this.layer = layer;
    }
}

interface WMS_PARAMS {
    LAYERS: string;
    SRS: string;
    TILED: boolean;
    VERSION: string;
}

export class FeatureLayer {
    private title: string;
    private visible: boolean;
    public tile: TileLayerWrapper;
    public vector: VectorLayerWrapper;

    constructor(title: string, tile: TileLayerWrapper, vector: VectorLayerWrapper) {
        this.title = title;
        this.tile = tile;
        this.vector = vector;
    }

    public getTitle(): string {
        return this.title;
    }

    public getVisible(): boolean {
        return ((this.tile.layer.getSource() as ol.source.TileWMS).getParams() as WMS_PARAMS).LAYERS.includes(this.tile.config.layer) 
            && this.vector.layer.getVisible();
    }

    public setVisible(visible: boolean, index?: number) {
        this.toggleTileLayer(visible, index);
        this.vector.layer.setVisible(visible);
    }

    private toggleTileLayer(visible: boolean, index?: number) {
        let olTileLayerSrc = (this.tile.layer.getSource() as ol.source.TileWMS);
        let params = (olTileLayerSrc.getParams() as WMS_PARAMS);
        if(!visible) {
            params.LAYERS = params.LAYERS.split(',').filter((layerStr) => {
                return layerStr !== this.tile.config.layer;
            }).join();
        } else {
            let layersArr = (params.LAYERS !== '') ? params.LAYERS.split(',') : [];
            (index != null) ? layersArr.splice(index, 0, this.tile.config.layer) : layersArr.push(this.tile.config.layer);
            params.LAYERS = layersArr.join();
        }
        olTileLayerSrc.updateParams(params);
        olTileLayerSrc.refresh();
    }
}

export class MapLayer {
    public config: MapSource;
    public layer: ol.layer.Tile;

    constructor(config: MapSource, layer: ol.layer.Tile) {
        this.config = config;
        this.layer = layer;
    }

    public getTitle(): string {
        return this.config.title;
    }

    public getVisible(): boolean {
        return this.layer.getVisible();
    }

    public setVisible(visible: boolean) {
        this.layer.setVisible(visible);
    }
}

export default class MapViewerInterface {
    private mapInterface: OpenLayersInterface;
    private deleteInteraction: ol.interaction.Select;
    private activeDrawButton: Element;
    private ignoreNextClick: boolean;
    private loaderHandler: LoaderHandler;
    private jumpTo: any;

    private baseLayers: MapLayer[];
    private featureLayers: FeatureLayer[];
    
    private listeners: EventListeners;

    private onFeatureSelect: (feature: GETMFeature) => void;

    constructor() {
        this.ignoreNextClick = false;
        this.activeDrawButton = null;

        this.baseLayers = [];
        this.featureLayers = [];
    }

    public attachInterface() {
        this.mapInterface = new OpenLayersInterface('map', LocalStorageUtils.getLayerState(ConfigurationUtil.getMapConfigs(), 'mapLayerState'));

        // Initialize map center and zoom.
        let mapViewState = LocalStorageUtils.getState(LocalStorageUtils.MAP_VIEW_STATE);
        if(mapViewState) {
            this.mapInterface.setView(new ol.View(mapViewState));
        }

        this.addListeners();
        this.addLayers();
        this.addControls();

        this.addDeleteInteraction();
        this.addSelectInteraction();

        this.addVectorHandler();
        this.addTileHandler();

        this.setUpListeners();
    }

    public registerListener(type: string, callback, oneTime?: boolean): number {
        return this.listeners.registerListener(type, callback, oneTime);
    }

    public removeListener(type: string, id: number) {
        this.listeners.removeListener(type, id);
    }

    public updateSize() {
        if(this.mapInterface) {
            this.mapInterface.updateSize();
        }
    }

    public getMapLayers(): MapLayer[] {
        return this.baseLayers;
    }

    public getFeatureLayers(): FeatureLayer[] {
        return this.featureLayers;
    }

    private addListeners() {
        this.mapInterface.on('moveend', (e: ol.MapEvent) => {
            let mapViewState = {projection: 'EPSG:4326', center: e.map.getView().getCenter(), zoom: e.map.getView().getZoom()}
            LocalStorageUtils.setState(mapViewState, LocalStorageUtils.MAP_VIEW_STATE);
        });
    }

    private addLayers() {
        // Store map layers with configs.
        this.mapInterface.getMapLayers().forEach((layer) => {
            let layerConfig = ConfigurationUtil.getMapConfigs().find((e) => {
                return e.title === layer.get('name');
            });
            this.baseLayers.push(new MapLayer(layerConfig, layer));
        });

        // Create WMS feature layer.
        let layerConfig = ConfigurationUtil.getWmsLayerConfig();
        let olTileLayer = this.getTileLayer(layerConfig);
        
        let layers = [];
        // Add overlays and store layers with configs.
        LocalStorageUtils.getLayerState(ConfigurationUtil.getLayerConfigs(), LocalStorageUtils.FEATURE_LAYER_STATE).forEach((layer) => {
            if(layer.visible) {
                layers.push(layer.wms.layer);
            }

            // Wrap config and vector layer.
            let olVectorLayer = this.getVectorLayer(layer.wfs, StyleUtils.getStyle.bind(layer.wfs.style), layer.visible);
            this.mapInterface.addVectorLayer(olVectorLayer);
            let vectorLayer = new VectorLayerWrapper(layer.wfs, olVectorLayer);

            // Wrap config and tile layer.
            let tileLayer = new TileLayerWrapper(layer.wms, olTileLayer);
            let featureLayer = new FeatureLayer(layer.title, tileLayer, vectorLayer);
            this.featureLayers.push(featureLayer);
        });

        // Set LAYERS param on WMS feature layer.
        let olTileLayerSrc = olTileLayer.getSource() as ol.source.TileWMS;
        let params = olTileLayerSrc.getParams() as WMS_PARAMS;
        params.LAYERS = layers.join();
        olTileLayerSrc.updateParams(params);
        this.mapInterface.addTileLayer(olTileLayer);
    }

    private addControls() {
        // Add controls.
        initJumpTo(ol);
        this.jumpTo = new (ol.control as any).JumpTo({position: 'top', hidden: true, urls: {brUrl: ConfigurationUtil.getBeUrl(), mdalUrl: ConfigurationUtil.getMdalUrl(), parseMdalUrl: ConfigurationUtil.getParseMdalUrl()}});
        this.mapInterface.addControl(this.jumpTo);
        this.mapInterface.addControl(new ButtonControl({className: 'jumpto-button-control', iconClassName: 'jumpto-button-icon jumpto-button', onClick: () => {this.handleJumpToToggle()}}));
        this.mapInterface.addControl(new DrawControl({className: 'draw', handleClick: this.handleDrawClick.bind(this)}));
        let loaderControl = new LoaderControl({className: 'loader-control'});
        this.loaderHandler = new LoaderHandler(loaderControl);
        this.mapInterface.addControl(loaderControl);
        this.mapInterface.addControl(new ButtonControl({className: 'layers-control', iconClassName: 'layers-control-icon icon-layers', onClick: () => {this.listeners.fire(Events.LAYERS_TOGGLE);}}));
        this.mapInterface.addControl(new ol.control.ZoomSlider());
        this.mapInterface.addControl(new ol.control.MousePosition({
            coordinateFormat: MapUtils.getCoordinateFormat(4),
            projection: 'EPSG:4326'
        }));
    }

    private handleDrawClick(e: MouseEvent, shapeType: string) {
        this.activeDrawButton = e.target as Element;
        this.activeDrawButton.classList.toggle("ol-draw-selected");

        let draw;
        switch(shapeType) {
            case 'rectangle': {
                draw = new ol.interaction.Draw({
                    source: this.mapInterface.getFeatureLayer().getSource(),
                    type: "Circle",
                    geometryFunction: ol.interaction.Draw.createBox()
                });
                break;
            }
            case 'circle': {
                draw = new ol.interaction.Draw({
                    source: this.mapInterface.getFeatureLayer().getSource(),
                    type: "Circle",
                    geometryFunction: ol.interaction.Draw.createRegularPolygon(200,0)
                });
                break;
            }
            case 'ellipse': {
                draw = new ol.interaction.Draw({
                    source: this.mapInterface.getFeatureLayer().getSource(),
                    type: 'Circle',
                    geometryFunction: function(coordinates, geometry) {
                        if(!geometry) {
                            geometry = new ol.geom.Circle([coordinates[0][0], coordinates[0][1]], 0.0000001, 'XY');
                            geometry = ol.geom.Polygon.fromCircle((geometry as ol.geom.Circle), 200);
                        }
                        var extent = geometry.getExtent();
                        var center = [0.5*(extent[0] + extent[2]), 0.5 * (extent[1] + extent[3])];   
                        var scaleX = 2*(center[0] - coordinates[1][0]) / (extent[0] - extent[2]);
                        var scaleY = 2*(center[1] - coordinates[1][1]) / (extent[1] - extent[3]);
                        if(scaleX == 0) scaleX = 1;
                        if(scaleY == 0) scaleY = 1;
                        var transX = (coordinates[0][0]+coordinates[1][0])/2 - center[0];
                        var transY = (coordinates[0][1]+coordinates[1][1])/2 - center[1];
                        geometry.translate(transX, transY);   
                        geometry.scale(scaleX, scaleY);
                        return geometry;
                    }
                });
                break;
            }
            case 'freeform': {
                draw = new ol.interaction.Draw({
                    source: this.mapInterface.getFeatureLayer().getSource(),
                    type: "LineString",
                    freehand: true
                });
                break;
            }
            case 'polyline': {
                draw = new ol.interaction.Draw({
                    source: this.mapInterface.getFeatureLayer().getSource(),
                    type: "LineString"
                });
                break;
            }
            case 'polygon': {
                draw = new ol.interaction.Draw({
                    source: this.mapInterface.getFeatureLayer().getSource(),
                    type: "Polygon",
                    freehand: false
                });
                break;
            }
            case 'delete': {
                this.deleteInteraction.setActive(!this.deleteInteraction.getActive()); // toggle
                break; 
            }
        }

        if(draw) {
            draw.on('drawend', function(e) {
                this.activeDrawButton.classList.toggle("ol-draw-selected");
                this.activeDrawButton = null;
                this.ignoreNextClick = true; // Set flag to ignore "click" event on draw end.
                draw.setActive(false);
                this.mapInterface.clearDrawInteraction();
                this.listeners.fire(Events.CREATE, e.feature);
            }.bind(this));

            this.mapInterface.addDrawInteraction(draw);
        }
    }

    private addDeleteInteraction() {
        this.deleteInteraction = new ol.interaction.Select({
            layers: [this.mapInterface.getFeatureLayer()]
        });
    
        // delete selected feature
        this.deleteInteraction.getFeatures().on('add', function (e) {
            this.activeDrawButton.classList.toggle("ol-draw-selected");
            this.mapInterface.getFeatureLayer().getSource().removeFeature(e.element);
            this.deleteInteraction.getFeatures().remove(e.element);
            this.deleteInteraction.setActive(false);  
        }.bind(this));
    
        // default delete interaction is off
        this.deleteInteraction.setActive(false);

        this.mapInterface.addInteraction(this.deleteInteraction);
    }

    private addSelectInteraction() {
        let select = new ol.interaction.Select({
            layers: this.mapInterface.getVectorLayers()
        });

        select.getFeatures().on('add', function (e) {
            this.listeners.fire(Events.SELECT, e.element.getProperties());
        }.bind(this));

        this.mapInterface.addInteraction(select);
    }

    private setUpListeners() {
        this.listeners = new EventListeners(Events);
    }

    // Change Polygons and MultiPolygons to Lines and MultiLineString so that they act like lines when selected.
    private addVectorHandler() {
        this.mapInterface.getVectorLayers().forEach((vectorLayer) => {
            vectorLayer.getSource().on('addfeature', (e: ol.source.VectorEvent) => {
                if(e.feature.getGeometry() instanceof ol.geom.Polygon) {
                    // Convert to LineString
                    e.feature.setGeometry(new ol.geom.LineString((e.feature.getGeometry() as ol.geom.Polygon).getCoordinates()[0])); // Use outer boundary of Polygon.
                } else if(e.feature.getGeometry() instanceof ol.geom.MultiPolygon) {
                    let coords = [];
                    (e.feature.getGeometry() as ol.geom.MultiPolygon).getPolygons().forEach((polygon: ol.geom.Polygon) => {
                        coords.push(polygon.getCoordinates()[0]);
                    });
                    e.feature.setGeometry(new ol.geom.MultiLineString(coords));
                }
            });
        });
    }

    private addTileHandler() {
        this.mapInterface.getTileLayers().forEach((tileLayer) => {
            let source = tileLayer.getSource();
            source.on('tileloadstart', (e: ol.source.TileEvent) => {
                this.loaderHandler.taskStart(true);
            });
            source.on('tileloadend', (e: ol.source.TileEvent) => {
                this.loaderHandler.taskEnd(true);
            });
            source.on('tileloaderror', (e: ol.source.TileEvent) => {
                this.loaderHandler.taskEnd(true);
            });
        });
    }

    private getVectorLayer(vectorConfig: VectorConfig, style: ol.style.Style | ol.style.Style[] | ol.StyleFunction, visible?: boolean): ol.layer.Vector {
        let format = new ol.format.WFS();
        let src = new ol.source.Vector({
            strategy: ol.loadingstrategy.bbox,
            loader: (extent) => {
                this.loaderHandler.taskStart();
                $.ajax(vectorConfig.hostAddress + vectorConfig.url, {
                    type: 'GET',
                    data: {
                        VERSION: vectorConfig.version,
                        BBOX: extent.join(',') + ',EPSG:4326'
                    }
                }).done((response) => {
                    src.addFeatures(format.readFeatures(response));
                    this.loaderHandler.taskEnd();
                }).fail(() => {
                    this.loaderHandler.taskEnd();
                    console.log('Vector source failed.')
                })
            }
        });
        let layer = new ol.layer.Vector({
            source: src,
            style: style,
            visible,
            maxResolution: vectorConfig.maxResolution,
            minResolution: vectorConfig.minResolution
        });
        return layer;
    }

    public getTileLayer(tileConfig) {
        var extent = ol.proj.get('EPSG:4326').getExtent();
        var startResolution = ol.extent.getWidth(extent) / 256;
        var resolutions = new Array(22);
        for (var i = 0, ii = resolutions.length; i < ii; ++i) {
          resolutions[i] = startResolution / Math.pow(2, i);
        }

        return new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: tileConfig.hostAddress + tileConfig.url,
                params: {
                    LAYERS: tileConfig.layers,
                    TILED: true,
                    VERSION: tileConfig.version,
                    SRS: 'EPSG:4326'
                },
                tileGrid: new ol.tilegrid.TileGrid({extent, resolutions, tileSize: [512, 512]}),
                crossOrigin: 'anonymous',
                projection: 'EPSG:4326',
            }),
            maxResolution: tileConfig.maxResolution,
            minResolution: tileConfig.minResolution
        });
    }

    private handleJumpToToggle() {
        this.jumpTo.toggle();
    }
}