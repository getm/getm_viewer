declare const CGSWeb_Map;
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

    navBarNav.appendChild(createNavButton('mapLayerButton', 'Map Layers'));
    navBarNav.appendChild(createNavButton('getmButton', 'GETM'));    

    navBarNav.appendChild(createNavDropDownForm());
    navBarNav.appendChild(createNavDropDownWFS());
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

function createNavDropDownForm() {
    var li = document.createElement('li');
    li.className = 'dropdown';

    var a = document.createElement('a');
    a.className = 'dropdown-toggle';
    a.setAttribute('data-toggle', 'dropdown');
    a.href = '#';
    a.innerHTML = 'Search';
    li.appendChild(a);
    
    var caret = document.createElement('span');
    caret.className = 'caret';
    a.appendChild(caret);

    var div = document.createElement('div');
    div.className = 'dropdown-menu';
    li.appendChild(div);

    var form = document.createElement('form');
    form.id = 'formSeach';
    form.className = 'form container-fluid';
    div.appendChild(form);

    var besearchGroup = document.createElement('div');
    besearchGroup.className = 'form-group';
    form.appendChild(besearchGroup);

    var besearchLabel = document.createElement('label');
    besearchLabel.htmlFor = 'besearch';
    besearchLabel.innerHTML = 'BE Search:';
    besearchGroup.appendChild(besearchLabel);

    var besearchInput = document.createElement('input');
    besearchInput.type = 'text';
    besearchInput.className = 'form-control';
    besearchInput.id = 'besearch';
    besearchGroup.appendChild(besearchInput);

    var besearchButton = document.createElement('button');
    besearchButton.type = 'button';
    besearchButton.id = 'besearchBtn';
    besearchButton.className = "btn btn-block";
    besearchButton.innerHTML = 'Search';
    form.appendChild(besearchButton);

    var divider = document.createElement('div');
    divider.className = 'divider';
    form.appendChild(divider);

    var catsearchGroup = document.createElement('div');
    catsearchGroup.className = 'form-group';
    form.appendChild(catsearchGroup);

    var catsearchLabel = document.createElement('label');
    catsearchLabel.htmlFor = 'catsearch';
    catsearchLabel.innerHTML = 'Cat Search:';
    catsearchGroup.appendChild(catsearchLabel);

    var catsearchInput = document.createElement('input');
    catsearchInput.type = 'text';
    catsearchInput.className = 'form-control';
    catsearchInput.id = 'catsearch';
    catsearchGroup.appendChild(catsearchInput);

    var catsearchButton = document.createElement('button');
    catsearchButton.type = 'button';
    catsearchButton.id = 'catsearchBtn';
    catsearchButton.className = "btn btn-block";
    catsearchButton.innerHTML = 'Search';
    form.appendChild(catsearchButton);

    return li;
    // <li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">Login <span class="glyphicon glyphicon-log-in"></span></a>
    //     <div class="dropdown-menu">
    //         <form id="formLogin" class="form container-fluid">
    //             <div class="form-group">
    //                 <label for="usr">Name:</label>
    //                 <input type="text" class="form-control" id="usr">
    //             </div>
    //             <div class="form-group">
    //                 <label for="pwd">Password:</label>
    //                 <input type="password" class="form-control" id="pwd">
    //             </div>
    //             <button type="button" id="btnLogin" class="btn btn-block">Login</button>
    //         </form>
}

function createNavDropDownWFS() {
    var li = document.createElement('li');
    li.className = 'dropdown';

    var a = document.createElement('a');
    a.className = 'dropdown-toggle';
    a.setAttribute('data-toggle', 'dropdown');
    a.href = '#';
    a.innerHTML = 'WFS';
    li.appendChild(a);
    
    var caret = document.createElement('span');
    caret.className = 'caret';
    a.appendChild(caret);

    var div = document.createElement('div');
    div.className = 'dropdown-menu';
    li.appendChild(div);

    var form = document.createElement('form');
    form.id = 'formWFS';
    form.className = 'form container-fluid';
    div.appendChild(form);

    CGSWeb_Map.Options.layers.wfsMapConfigs.forEach(function(wfsMapConfig){
        var div = document.createElement('div');
        form.appendChild(div);

        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = wfsMapConfig.name.replace(/\W/g, '') + '_checkbox';
        div.appendChild(input);

        var label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.innerHTML = wfsMapConfig.title;
        div.appendChild(label);
    });
    return li;
}