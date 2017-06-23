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

    // navBarNav.appendChild(createNavDropDownTwice('asdf', {'asd': 'fds'}));
}

function createNavButton(id, innerText) {
    var li = document.createElement('li');
    
    var a = document.createElement('a');
    a.href = '#';
    a.id = id;
    a.innerHTML = innerText;
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
    }

    return li;
}

// function createNavDropDownTwice(title, options) {
//     var li = document.createElement('li');

//     var a = document.createElement('a');
//     // a.className = 'dropdown-toggle';
//     a.id='menu1';
//     a.setAttribute('data-toggle', 'dropdown');
//     a.href = '#';
//     li.appendChild(a);

//     var label = document.createElement('span');
//     label.innerHTML = title;
//     a.appendChild(label);

//     var caret = document.createElement('span');
//     caret.className = 'caret';
//     a.appendChild(caret);

//     var dropdownMenu = document.createElement('ul');
//     dropdownMenu.className = 'dropdown-menu';
//     dropdownMenu.setAttribute('aria-labelledby', 'menu1')
//     li.appendChild(dropdownMenu);

//     for(var o in options) {
//         console.log(options[o]);

//         var optioncontent = document.createElement('li');
//         dropdownMenu.appendChild(optioncontent);

//         var a2 = document.createElement('a');
//         // a2.className = 'dropdown-toggle';
//         a2.setAttribute('data-toggle', 'dropdown');
//         a2.id = 'menu2'
//         a2.href = '#';
//         optioncontent.appendChild(a2);

//         var label2 = document.createElement('span');
//         label2.innerHTML = title;
//         a2.appendChild(label2);

//         var caret2 = document.createElement('span');
//         caret2.className = 'caret';
//         a2.appendChild(caret2);

//         var dropdownMenu2 = document.createElement('ul');
//         dropdownMenu2.className = 'dropdown-menu dropdown-menu-right';
//         dropdownMenu.setAttribute('aria-labelledby', 'menu2')
//         optioncontent.appendChild(dropdownMenu2);
//         var options2 = {'a': 'b', 'c': 'd'};
//         for(var o in options2) {
//             var optionItem = document.createElement('li');
//             dropdownMenu2.appendChild(optionItem);

//             var optionContent2 = document.createElement('a');
//             optionContent2.href = '#';
//             optionContent2.id = o;
//             optionContent2.innerHTML = options2[o];
//             optionItem.appendChild(optionContent2);
//         }
//     }
//     return li;
// }