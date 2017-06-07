import * as $ from 'jquery';



export function getmFiltersSetup() {
    var getmFilters = document.getElementById("getmFilters");
    var read = new XMLHttpRequest();
    read.open('GET', 'getmFilters.html', false);
    read.send();
    getmFilters.innerHTML=read.responseText;
}