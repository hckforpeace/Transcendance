"use strict";
// // login.ts
// const loginURL:string = "https://" + currentUrl + ':' + currentPort + '/api/login';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function renderAvatar() {
    fetch("/api/avatar")
        .then(response => response.json())
        .then(data => {
        if (data.avatarUrl) {
            updateUserAvatar(data.avatarUrl);
        }
    })
        .catch(err => {
        console.error("Error fetching avatar:", err);
    });
}
function load2faView() {
    const template2fa = document.getElementById("2fa_template");
    const form = document.getElementById("login-form");
    if (!template2fa || !form)
        return;
    const elem2fa = template2fa.content.cloneNode(true);
    form.innerHTML = '';
    form.appendChild(elem2fa);
    const inputElement = document.getElementById('2fa-input');
    if (!inputElement) {
        console.error('2FA input element not found');
        return;
    }
    inputElement.addEventListener('input', (event) => {
        const target = event.target;
        target.value = target.value.replace(/\D/g, ''); // Remove non-digit characters
        // Truncate input to 6 characters if it exceeds the limit
        if (target.value.length > 6) {
            target.value = target.value.slice(0, 6);
        }
        if (inputElement.value.length === 6) {
            console.log('6 characters entered:', inputElement.value);
            send2faCode();
            inputElement.disabled = true; // Make the field uneditable
            inputElement.style.backgroundColor = '#e0e0e0'; // Change background color to indicate disabled state
            inputElement.style.color = '#888'; // Change text color for visual indication
        }
    });
}
;
function send2faCode() {
    const formElement = document.getElementById("login-form");
    if (!formElement)
        return;
    const errorMsg = document.getElementById("form-error-msg");
    if (!errorMsg)
        return;
    errorMsg.textContent = ""; // Reset previous error
    errorMsg.style.color = "red";
    const formData = new FormData(formElement);
    formData.append("user_id", localStorage.getItem("user_id") || "");
    const inputElement = document.getElementById('2fa-input');
    if (!inputElement)
        return;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            try {
                if (this.status === 200) {
                    console.log("Valid 2fa Code");
                    // isLoggedIn = true;
                    errorMsg.style.color = "green";
                    errorMsg.textContent = "Welcome!";
                    //                                     // Corrected: fetch avatar and update it
                    fetch("/api/avatar")
                        .then(response => response.json())
                        .then(data => {
                        if (data.avatarUrl) {
                            updateUserAvatar(data.avatarUrl);
                        }
                    })
                        .catch(err => {
                        console.error("Error fetching avatar:", err);
                    });
                    navigateTo('/');
                }
                else {
                    inputElement.disabled = false; // Make the field uneditable
                    inputElement.style.backgroundColor = '#FFFFFF'; // Change background color to indicate disabled state
                    inputElement.style.color = '#222'; // Change text color for visual indication
                    inputElement.value = ""; // Clear the input field after sending the code
                    const response = JSON.parse(this.responseText);
                    errorMsg.textContent = response.error || "An error occurred.";
                }
            }
            catch (e) {
                errorMsg.textContent = "Unexpected error";
            }
        }
    };
    xhttp.open("POST", "/auth/2fa", true);
    console.log(formData);
    xhttp.send(formData);
}
function login() {
    const formElement = document.getElementById("login-form");
    if (!formElement)
        return;
    const userField = document.getElementById("username");
    const userValue = userField ? userField.value : "";
    localStorage.setItem("user_id", userValue);
    const errorMsg = document.getElementById("form-error-msg");
    if (!errorMsg)
        return;
    errorMsg.textContent = "";
    errorMsg.style.color = "red";
    const formData = new FormData(formElement);
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            try {
                if (this.status === 400 || this.status === 500) {
                    const response = JSON.parse(this.responseText);
                    errorMsg.textContent = response.error || "An error occurred.";
                }
                if (this.status === 200) {
                    load2faView();
                    // errorMsg.style.color = "green";
                    // errorMsg.textContent = "Welcome!";
                    //      			renderAvatar();
                    // navigateTo('/');
                }
            }
            catch (e) {
                errorMsg.textContent = "Unexpected error";
            }
        }
    };
    xhttp.open("POST", "/api/login", true);
    console.log(formData);
    xhttp.send(formData);
}
const displayAvatarMenu = () => {
    // Corrected: fetch avatar and update it
    fetch("/api/avatar")
        .then(response => response.json())
        .then(data => {
        if (data.avatarUrl) {
            updateUserAvatar(data.avatarUrl);
        }
    })
        .catch(err => {
        console.error("Error fetching avatar:", err);
    });
};
// ***************************************************************************
//                                   Google sign-in
// ***************************************************************************
function handleCredentialResponse(response) {
    return __awaiter(this, void 0, void 0, function* () {
        const errorMsg = document.getElementById("form-error-msg");
        if (!errorMsg)
            return;
        const res = yield fetch('/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Token: response.credential }),
        });
        if (res.ok) {
            console.log('success');
            renderAvatar();
            //isLoggedIn = true;
            navigateTo('/');
        }
        else if (res.status === 400) {
            const response = yield res.json();
            console.log(response.error);
            errorMsg.textContent = response.error;
        }
        // Send to backend for verification
    });
}
function oauth2() {
    var btn = document.getElementById("g_id_signin");
    if (btn) {
        google.accounts.id.initialize({
            client_id: "998291091717-69t8ub79jvhdfq195vqtc93buajcgsaf.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            auto_select: false,
        });
        google.accounts.id.renderButton(btn, { theme: "outline", size: "large", type: "standard" });
    }
}
