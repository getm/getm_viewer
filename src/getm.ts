import * as $ from 'jquery';
import 'jqueryui';
import './getm.css';
import {source} from './map';
import {features} from './draw';
// for debugging
document.getElementById('debug').innerHTML = "Debug Texts Go Here";

export function getmPopup() {
    var getmPopupText = document.getElementById("getmPopupText");

    // toggle getm popup
    if(getmPopupText.classList.toggle("show")) {
        // read popup content from file -- TODO: remember this info rather than regen?
        var read = new XMLHttpRequest();
        read.open('GET', 'getm.html', false);
        read.send();
        getmPopupText.innerHTML=read.responseText;

        // populate layer select
        var layerSelect = document.getElementById('layer-select');
        for (var x of ['asdf', 'qwerty', 'dvorak']) //TODO: select the layers from somewhere
        {
            var layerOpt = document.createElement('option');
            layerOpt.innerHTML = x;
            layerSelect.appendChild(layerOpt);
        }

        // fill out inside of the windows stuff

        // first column contains newly drawn shapes
        var shapeEntries = [Object.keys(features), ['44444','55555','66666'], ['77777','88888','99999']];
        var shapeActions = ['insertShapes', 'updateShapes', 'deleteShapes']; //TODO: select the layers from somewhere
        var shapes = document.getElementById('shapes');
        for(var a in shapeActions)
        {
            var thing = document.createElement('div');
            thing.id = shapeActions[a];
            shapes.appendChild(thing);

            var label = document.createElement('label');
            label.innerText = shapeActions[a].charAt(0).toUpperCase() + shapeActions[a].replace('Shapes', ' Shapes').slice(1);
            thing.appendChild(label);

            var form = document.createElement('form');
            form.action = '/action_page.php';
            thing.appendChild(form);

            var div1 = document.createElement('div');
            form.appendChild(div1);

            var select = document.createElement('select');
            select.multiple = true;
            div1.appendChild(select);

            for (var x of shapeEntries[a]) //TODO: select options from sources or something...?
            {
                var opt = document.createElement('option');
                opt.innerHTML = x;
                select.appendChild(opt);
            }

            var div2 = document.createElement('div');
            form.appendChild(div2);

            var input = document.createElement('input');
            input.type = 'submit';
            div2.appendChild(input);
        }

        // TODO: not sure if i need this...
        var getmCloseBtn = document.createElement('button');
        getmCloseBtn.className = "close";
        getmCloseBtn.innerHTML = "&times;";
        document.getElementById("getm-close").appendChild(getmCloseBtn);
        getmCloseBtn.onclick = hidePopup;

        // move around the popup
        $("#getmPopup").draggable();
        $("#getmPopup").resizable();
        $("#getmPopup").zIndex(2);
    }
}

// do i need this? hidepopup is only called once...
function hidePopup() {
    var getmPopupText = document.getElementById("getmPopupText");
    getmPopupText.classList.toggle("show");
    $('#getmPopup').zIndex(-1);
}
