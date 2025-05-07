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
document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('register');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield fetch('/api/register');
                const html = yield res.text();
                const contentDiv = document.getElementById('content-div');
                if (contentDiv)
                    contentDiv.innerHTML = html;
                // Optionally load related JS (like form handling)
                //import('./public/js/register.js');
            }
            catch (err) {
                console.error('Error loading register view:', err);
            }
        }));
    }
});
