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
// Construct the register URL dynamically
const currentUrl = window.location.hostname;
const currentPort = window.location.port;
const registerURL = "https://" + currentUrl + ':' + currentPort + '/api/register';
// JSON object for register request
const headerRegisterRequest = (name, email, pw) => ({
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: name,
        email: email,
        password: pw,
    }),
});
// Fetch request to register
function registerUser(url, header) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(url, header)
            .then(response => {
            if (response.redirected) {
                window.location.href = response.url; // follow redirect manually
                return;
            }
            return response.json();
        })
            .then((data) => {
            if (data === null || data === void 0 ? void 0 : data.error) {
                console.error("Registration error:", data.error);
                alert("Registration failed: " + data.error);
            }
            else {
                console.log("User registered successfully.");
            }
        })
            .catch((error) => {
            console.error('Error:', error);
        });
    });
}
// Submit event for registration form
function registerSubmitEvent(event) {
    event.preventDefault();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const pw = document.getElementById('pw');
    if (!name || !email || !pw)
        return;
    registerUser(registerURL, headerRegisterRequest(name.value, email.value, pw.value));
}
// Initialize on DOM load
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("register-form");
    if (!form)
        return;
    form.addEventListener("submit", registerSubmitEvent);
});
