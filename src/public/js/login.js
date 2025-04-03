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
    const form = document.getElementById("form");
    const url = "https://localhost:8080/api/login";
    if (!form)
        return;
    function logSubmit(event) {
        event.preventDefault(); // Prevent default form submission
        const uname = document.getElementById('uname');
        const pw = document.getElementById('pw');
        if (!uname || !pw)
            return;
        // console.log(uname.value, pw.innerHTML);
        login(url, headerLoginRequest(uname.value, pw.value));
    }
    form.addEventListener("submit", logSubmit);
});
