"use strict";
const currentUrl = window.location.hostname;
const currentPort = window.location.port;
const currentRoot = currentUrl + ":" + currentPort;
var disableScroll = false;
document.addEventListener('keydown', function (event) {
    if (disableScroll && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault(); // Disable default scroll behavior
    }
});
