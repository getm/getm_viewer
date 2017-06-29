import * as $ from 'jquery';
import m = require('./map');
import {setup} from './getm';
import {navSetup} from './nav';
import {drawSetup} from './draw';
import {layerInfoSetup} from './layerinfo';
import './css/index.css';
declare const CGSWeb_Map; 
// Expose jQuery so Bootstrap can use it.
(window as any).$ = $;
(window as any).jQuery = $;

function setupTopAndBottomBanners() {
    var topBanner = document.createElement('div');
    topBanner.id = 'topBanner';
    topBanner.className = 'securityBanner';
    topBanner.innerHTML = CGSWeb_Map.Options.banner_text;
    document.getElementById('app').appendChild(topBanner);
    var bottomBanner = document.createElement('div');
    bottomBanner.id = 'bottomBanner';
    bottomBanner.className = 'securityBanner';
    bottomBanner.innerHTML = CGSWeb_Map.Options.banner_text;
    document.getElementById('app').appendChild(bottomBanner);
    $('.securityBanner').css('background-color', CGSWeb_Map.Options.banner_color)
}
navSetup();
setupTopAndBottomBanners();
setup();
drawSetup();
layerInfoSetup();
m.setupMap();