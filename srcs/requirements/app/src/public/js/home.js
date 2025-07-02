"use strict";
function injectViewToContentDiv(data) {
    return new Promise((resolve) => {
        const contentDiv = document.getElementById('content-div');
        contentDiv.innerHTML = data;
        resolve(); // Resolve after DOM update
    });
}
