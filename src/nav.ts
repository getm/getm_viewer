export function navSetup() {
    var nav = document.createElement('nav');
    nav.className = "navbar navbar-inverse";
    document.getElementById('nav').appendChild(nav);

    var navContainer = document.createElement('div');
    navContainer.className = 'container-fluid';
    nav.appendChild(navContainer);

    var navBarHeader = document.createElement('div');
    navBarHeader.className = 'navbar-header';
    navContainer.appendChild(navBarHeader);

    var navBarBrand = document.createElement('a');
    navBarBrand.className = 'navbar-brand';
    navBarBrand.href = '#';
    navBarBrand.innerHTML = 'GETM Window';
    navBarHeader.appendChild(navBarBrand);

    var navBarNav = document.createElement('ul');
    navBarNav.className = 'nav navbar-nav';
    navContainer.appendChild(navBarNav);

    var fileOption = createNavDropDown('File', 
    {
        'saveSessBtn': 'Save Session',
        'loadSessBtn': 'Load Session',
        'saveBtn': 'Save Shape',
        'printBtn': 'Print',
    });
    navBarNav.appendChild(fileOption);

    var toolsOption = createNavDropDown('Tools', 
    {
        'drawButton': 'Draw',
        'legend': 'Legend'
    });
    navBarNav.appendChild(toolsOption);

    var searchOption = createNavDropDown('Search',
    {
        'besearchBtn': 'BE Search',
        'catsearchBtn': 'Catcode Search'
    });
    navBarNav.appendChild(searchOption);

    navBarNav.appendChild(createNavButton('mapLayerButton', 'Map Layers'));
    navBarNav.appendChild(createNavButton('getmButton', 'GETM'));    
    navBarNav.appendChild(createNavButton('wfsButton', 'WFS'));
}

function createNavButton(id, innerText) {
    var li = document.createElement('li');
    
    var a = document.createElement('a');
    a.href = '#';
    a.id = id;
    a.innerText = innerText;
    li.appendChild(a);

    return li;
}

function createNavDropDown(title, options) {
    var li = document.createElement('li');

    var a = document.createElement('a');
    a.className = 'dropdown-toggle';
    a.setAttribute('data-toggle', 'dropdown');
    a.href = '#';
    li.appendChild(a);

    var label = document.createElement('span');
    label.innerHTML = title;
    a.appendChild(label);

    var caret = document.createElement('span');
    caret.className = 'caret';
    a.appendChild(caret);

    var dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'dropdown-menu';
    li.appendChild(dropdownMenu);

    for(var o in options) {
        var optionItem = document.createElement('li');
        dropdownMenu.appendChild(optionItem);

        var optionContent = document.createElement('a');
        optionContent.href = '#';
        optionContent.id = o;
        optionContent.innerHTML = options[o];
        optionItem.appendChild(optionContent);
        //
    }

    return li;
}