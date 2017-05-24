import m = require('./map');
import {getmSetup} from './getm';
import {navSetup} from './nav';
import {drawSetup} from './draw';
// opens up the overlay

navSetup();
getmSetup();
drawSetup();