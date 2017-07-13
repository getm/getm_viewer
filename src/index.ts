import * as $ from 'jquery';
import {mapSetup} from './map';
import {setup} from './getm';
import {navSetup} from './nav';
import {drawSetup} from './draw';
import {layerInfoSetup} from './layerinfo';
import {catsearchResultsSetup} from './search';
import {besearchResultsSetup} from './search';
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
setupTopAndBottomBanners();
navSetup();
setup();
drawSetup();
layerInfoSetup();
mapSetup();