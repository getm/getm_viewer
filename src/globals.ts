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
    viewLabels: false,
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

    this.popup = popup;

    var popupText = document.createElement('div');
    popupText.id = id+'PopupText';
    popupText.className = 'popuptext';
    popup.appendChild(popupText);

    this.popupText = popupText;

    var windowHeaders = document.createElement('div');
    windowHeaders.className = 'window-headers';
    popupText.appendChild(windowHeaders);
    this.windowHeaders = windowHeaders;

    var windowHeaderTitle = document.createElement('span');
    windowHeaderTitle.innerHTML = headerTitle;
    windowHeaders.appendChild(windowHeaderTitle);

    var windowHeadersCloseBtn = document.createElement('button');
    windowHeadersCloseBtn.className = "close";
    windowHeadersCloseBtn.id = id + "-close";
    windowHeadersCloseBtn.innerHTML = "&times;";
    windowHeadersCloseBtn.onclick = function () {
        $(popupText).removeClass('show');
        $(popupText).zIndex(-1);
    };
    windowHeaders.appendChild(windowHeadersCloseBtn);
    this.close = windowHeadersCloseBtn;
    
    var windowContents = document.createElement('div');
    windowContents.className = 'window-contents';
    windowContents.id = id + '-contents'; // TODO: CSS STILL DEPENDS ON THIS
    popupText.appendChild(windowContents);
    this.windowContents = windowContents;

    $(popup).draggable({cancel: '.window-contents'});

    this.center = function(){
        $(popup).css('left', window.innerWidth / 2  - $(popup).width()/2);
        $(popup).css('top', window.innerHeight / 2  - $(popup).height()/2);
    }

    this.show =  function() {
        $(popupText).addClass('show');
        $(popup).zIndex(2); 
    }

    this.hide =  function() {
        $(popupText).removeClass('show');
        $(popup).zIndex(-1); 
    }
}