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
const loginURL = "https://" + currentUrl + ':' + currentPort + '/api/login';
var local_user;
// json object for login request
const headerLoginRequest = (uname, pw) => ({
    method: 'POST',
    headers: { "Content-Type": "application/json",
    },
    body: JSON.stringify({
        username: uname,
        password: pw,
    }),
});
// fetch request to login
function login(url, header) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(url, header)
            .then(response => response.json())
            .then((data) => {
            localStorage.setItem("token", data.token);
            console.log(localStorage.getItem("token"));
        })
            .catch((error) => {
            console.error('Error:', error);
        });
    });
}
// Events
function submitEvent(event) {
    event.preventDefault(); // Prevent default form submission
    const uname = document.getElementById('uname');
    local_user = uname.value;
    const pw = document.getElementById('pw');
    if (!uname || !pw)
        return;
    login(loginURL, headerLoginRequest(uname.value, pw.value));
}
document.addEventListener("DOMContentLoaded", function () {
    // socket_connect();
    send_login();
});
function send_login() {
    const form = document.getElementById("form");
    if (!form)
        return;
    form.addEventListener("submit", submitEvent);
}
