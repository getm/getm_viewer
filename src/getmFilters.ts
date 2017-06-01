import * as $ from 'jquery';

function filterSearch() {
    console.log("besearch contains: " + $('#besearch').val());
    console.log("catcode contains: " + $('#catsearch').val());
}

export function getmFiltersSetup() {
    var getmFilters = document.getElementById("getmFilters");
    var read = new XMLHttpRequest();
    read.open('GET', 'getmFilters.html', false);
    read.send();
    getmFilters.innerHTML=read.responseText;

    // setup button actions
    $('#filterSearchBtn').click(filterSearch);

}