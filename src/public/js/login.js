"use strict";
// login.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const headerLoginRequest = (uname, pw) => ({
    method: 'POST',
    headers: { "Content-Type": "application/json",
    },
    body: JSON.stringify({
        username: uname,
        password: pw,
    }),
});
function login(url, header) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(url, header)
            .then((response) => {
            if (response.ok) {
                console.log("Login successful!");
            }
            else {
                console.error("Login failed!");
                throw new Error("Login failed");
            }
        });
    });
}
document.addEventListener("DOMContentLoaded", function () {
    socket_connect();
    const form = document.getElementById("form");
    const url = "https://localhost:8080/api/login";
    function logSubmit(event) {
        event.preventDefault(); // Prevent default form submission
        const uname = document.getElementById('uname');
        const pw = document.getElementById('pw');
        if (!uname || !pw)
            return;
        // console.log(uname.value, pw.innerHTML);
        login(url, headerLoginRequest(uname.value, pw.value));
    }
    if (!form)
        return;
    form.addEventListener("submit", logSubmit);
});
function socket_connect() {
    const remote = document.getElementById("remote");
    if (!remote)
        return;
    function connect(event) {
        const socket = new WebSocket("wss://localhost:8080/api/remote");
        socket.onopen = function (event) {
            socket.send("Hello hdhdhd i am gay!");
        };
        socket.onmessage = function (event) {
            alert(`[message] Data received from server: ${event.data}`);
        };
        socket.onclose = function (event) {
            if (event.wasClean) {
                alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            }
            else {
                // par exemple : processus serveur arrêté ou réseau en panne
                // event.code est généralement 1006 dans ce cas
                alert('[close] Connection died');
            }
        };
        socket.onerror = function (error) {
            alert(`[error]`);
        };
    }
    remote.addEventListener("click", connect);
}
// establish a connection to the server
// const socket = new WebSocket("ws://localhost:8080");
