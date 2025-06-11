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
var isLoggedIn = false;
const loginRedir = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetch("/api/login")
            .then(response => response.text())
            .then(html => {
            var content = document.getElementById("content-div");
            if (!content)
                throw new Error("Content div not found");
            content.innerHTML = html;
        });
    }
    catch (err) {
        console.error('Error loading login view:', err);
    }
});
function injectViewToContentDiv(data) {
    return new Promise((resolve) => {
        const contentDiv = document.getElementById('content-div');
        contentDiv.innerHTML = data;
        resolve(); // Resolve after DOM update
    });
}
function handleCredentialResponse(response) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('ID Token:', response.credential);
        const res = yield fetch('/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Token: response.credential }),
        });
        if (res.ok)
            console.log('success');
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
