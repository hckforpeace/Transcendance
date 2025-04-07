"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const currentUrl = window.location.hostname;
const currentPort = window.location.port;
const currentRoot = currentUrl + ":" + currentPort;
var socket;
function changeRegion() {
    var tag = document.getElementById("dynamic-script");
    if (!tag) {
        return;
    }
    tag.remove(); // remove the old script tag
    var newTag = document.createElement("script");
    newTag.id = "dynamic-script";
    newTag.type = "text/javascript";
    newTag.src = 'js/pong.js';
    var footer = document.getElementById("footer");
    if (!footer) {
        return;
    }
    footer.appendChild(newTag);
}
document.addEventListener("DOMContentLoaded", function () {
    socket_connect();
});
function fetchPong() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch("https://localhost:8080/api/pong", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then(response => response.text())
            .then(html => {
            var content = document.getElementById("content-div");
            if (!content)
                throw new Error("Content div not found");
            content.innerHTML = html;
            changeRegion();
        })
            .catch((error) => {
            console.error("Error:", error);
        });
    });
}
// TODO: do something with event parameter
function wsEvent(event) {
    var _a;
    console.log(currentRoot);
    socket = new WebSocket('wss://' + currentRoot + '/api/remote', (_a = localStorage.getItem("token")) === null || _a === void 0 ? void 0 : _a.toString());
    socket.onopen = function (event) {
        socket.send("Hello hdhdhd i am gay!");
        fetchPong();
    };
    socket.onmessage = function (event) {
        console.log(`[message] Data received from server: ${event.data}`);
    };
    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        }
        else {
            // par exemple : processus serveur arrêté ou réseau en panne
            // event.code est généralement 1006 dans ce cas
            console.log('[close] Connection died');
        }
    };
    socket.onerror = function (error) {
        console.log('connection refused');
    };
}
function socket_connect() {
    const remote = document.getElementById("start");
    if (!remote)
        return;
    remote.addEventListener("click", wsEvent);
}
