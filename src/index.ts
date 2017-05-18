import './map';
import {getmPopup} from './getm';
import './nav';
import {drawPopup} from './draw';
// opens up the overlay



var btn = document.createElement('button');
btn.innerText = 'draw';
document.getElementById('button').appendChild(btn);
btn.onclick = drawPopup;


var btn = document.createElement('button');
btn.innerText = 'getm';
document.getElementById('button').appendChild(btn);
btn.onclick = getmPopup;
