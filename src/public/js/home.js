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
const registerRedir = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetch("/api/register")
            .then(response => response.text())
            .then(html => {
            var content = document.getElementById("content-div");
            if (!content)
                throw new Error("Content div not found");
            content.innerHTML = html;
        });
    }
    catch (err) {
        console.error('Error loading register view:', err);
    }
});
function injectViewToContentDiv(data) {
    const contentDiv = document.getElementById('content-div');
    contentDiv.innerHTML = data;
}
