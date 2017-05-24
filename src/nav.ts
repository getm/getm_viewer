export function navSetup() {
    var read = new XMLHttpRequest();
    read.open('GET', 'nav.html', false);
    read.send();
    document.getElementById('nav').innerHTML=read.responseText;
}