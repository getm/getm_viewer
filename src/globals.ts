export var globals = {
    debug: false,
    selectedFeatureID: undefined,
    selectedFeature: undefined, // idk
    selectedLayer: undefined, // idk
    shapes: {},
    wfsFeatures: [],
    featuresArray: [],
    shapeLayer: undefined,
    basemapLayer: undefined,
    counts: {
        'rectangle': 0,
        'circle': 0,
        'ellipse': 0,
        'freeform': 0,
        'polyline': 0,
        'polygon': 0,
    }
}

export function windowSetup(id, headerTitle=id){
    var popup = document.createElement('div');
    popup.id = id+'Popup';
    popup.className = 'popup';
    document.getElementById('getmpage').appendChild(popup);

    var popupText = document.createElement('div');
    popupText.id = id+'PopupText';
    popupText.className = 'popuptext';
    popup.appendChild(popupText);

    var windowHeaders = document.createElement('div');
    windowHeaders.className = 'window-headers';
    popupText.appendChild(windowHeaders);

    var windowHeaderTitle = document.createElement('span');
    windowHeaderTitle.innerHTML = headerTitle;
    windowHeaders.appendChild(windowHeaderTitle);

    var windowHeadersCloseBtn = document.createElement('button');
    windowHeadersCloseBtn.className = "close";
    windowHeadersCloseBtn.id = id + "-close";
    windowHeadersCloseBtn.innerHTML = "&times;";
    windowHeadersCloseBtn.onclick = function () {
        popupText.classList.toggle("show");
        $(popupText).zIndex(-1);
    };
    windowHeaders.appendChild(windowHeadersCloseBtn);

    var windowContents = document.createElement('div');
    windowContents.className = 'window-contents';
    windowContents.id = id + '-contents';
    popupText.appendChild(windowContents);

    $(popup).draggable();
    $(popupText).resizable({
        handles: 'all'
    });
    return popup;
}