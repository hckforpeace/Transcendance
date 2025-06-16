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
function updateUserAvatar(avatarUrl) {
    const profileImg = document.getElementById('profile');
    if (!profileImg)
        return;
    profileImg.src = avatarUrl || '/images/avatar.jpg';
}
document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('tournament');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // const res = await fetch('/api/register', {});
                // .then
                // const html = await res.text();
                yield fetch("/api/tournament")
                    .then(response => response.text())
                    .then(html => {
                    var content = document.getElementById("content-div");
                    if (!content)
                        throw new Error("Content div not found");
                    content.innerHTML = html;
                });
                // Optionally load related JS (like form handling)
                //import('./public/js/register.js');
            }
            catch (err) {
                console.error('Error loading tournament view:', err);
            }
        }));
    }
});
// document.addEventListener('DOMContentLoaded', () => {
//   const loginBtn = document.getElementById('profile');
function getProfileView(callback) {
    fetch('/html/profile.html')
        .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return response.text(); // ✅ return the parsed JSON
    })
        .then(data => {
        injectViewToContentDiv(data);
        setTimeout(callback, 0);
    });
}
// function loadProfileView() {
//   getProfileView( () => {
//     renderProfile();
//   });
// }
