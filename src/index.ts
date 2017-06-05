import m = require('./map');
import {getmSetup, setupShapes} from './getm';
import {navSetup} from './nav';
import {drawSetup, saveShapes} from './draw';
import './css/index.css';
import './css/getmFilters.css';
import * as $ from 'jquery';
// opens up the overlay


navSetup();
getmSetup();
drawSetup();
m.populateLayers();

$('#getm-shape-layer-select').change(setupShapes);