"use strict";
function injectViewToContentDiv(data) {
    return new Promise((resolve) => {
        const contentDiv = document.getElementById('content-div');
        contentDiv.innerHTML = data;
        resolve(); // Resolve after DOM update
    });
}
function hideErrorMsg() {
    const errMsg = document.getElementById("not-logged-in-msg");
    if (!errMsg)
        return;
    errMsg.classList.add("hidden");
}
hideErrorMsg();
