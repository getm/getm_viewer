export var globals = {
    debug: true,
    selectedFeatureID: undefined,
    shapes: {}
}

export function windowSetup(id){
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
    windowHeaderTitle.innerHTML = id;
    windowHeaders.appendChild(windowHeaderTitle);

    var windowHeadersCloseBtn = document.createElement('button');
    windowHeadersCloseBtn.className = "close";
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