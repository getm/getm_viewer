import m = require('./map');
import {getmSetup} from './getm';
import {navSetup} from './nav';
import {drawSetup} from './draw';
import './css/index.css';
import './css/getmFilters.css';
// opens up the overlay

navSetup();
getmSetup();
drawSetup();
m.populateLayers();