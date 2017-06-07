import * as $ from 'jquery';
import m = require('./map');
import {getmSetup, setupShapes} from './getm';
import {navSetup} from './nav';
import {drawSetup} from './draw';
import {layerInfoSetup} from './layerinfo';
import './css/index.css';
import './css/getmFilters.css';
// opens up the overlay

// Expose jQuery so Bootstrap can use it.
(window as any).$ = $;
(window as any).jQuery = $;

navSetup();
getmSetup();
drawSetup();
layerInfoSetup();
m.populateLayers();


// TODO: plug these in somewhere
$('#getm-shape-layer-select').change(setupShapes);