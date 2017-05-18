
    document.getElementById('debug').innerHTML = "SOMETHINGSKJDFKLJDSLFJDS";
    export function getmPopup() {
        var popup = document.getElementById("popup");
        var mypopup = document.getElementById("myPopup");
        // z-index workaround
        if(mypopup.classList.toggle("show")) {
            // read popup from file
            var read = new XMLHttpRequest();
            read.open('GET', 'getm.html', false);
            read.send();
            mypopup.innerHTML=read.responseText;

            var getmCloseBtn = document.createElement('button');
            getmCloseBtn.className = "close";
            getmCloseBtn.innerHTML = "&times;";
            document.getElementById("getm-close").appendChild(getmCloseBtn);
            getmCloseBtn.onclick = hidePopup;

            // move around the popup
            $( ".popup" ).draggable();
            $( ".popup" ).resizable();
            $('.popup').zIndex(2);
        }  else {
            hidePopup();
        }
    }

    function hidePopup() {
        var mypopup = document.getElementById("myPopup");
        mypopup.classList.toggle("show");
        $('.popup').zIndex(-1);
    }
