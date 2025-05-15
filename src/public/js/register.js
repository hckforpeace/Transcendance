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
// // Construct the register URL dynamically
const currentUrl = window.location.hostname;
const currentPort = window.location.port;
// const registerURL: string = "https://" + currentUrl + ':' + currentPort + '/api/register';
// // JSON object for register request
// const headerRegisterRequest = (name: string, email: string, pw: string) => ({
//   method: 'POST',
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     name: name,
//     email: email,
//     password: pw,
//   }),
// });
// // Fetch request to register
// async function registerUser(url: string, header: any) {
//   await fetch(url, header)
//     .then(response => {
//       if (response.redirected) {
//         window.location.href = response.url; // follow redirect manually
//         return;
//       }
//       return response.json();
//     })
//     .then((data) => {
//       if (data?.error) {
//         console.error("Registration error:", data.error);
//         alert("Registration failed: " + data.error);
//       } else {
//         console.log("User registered successfully.");
//       }
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// }
// // Submit event for registration form
// function registerSubmitEvent(event: any) {
//   event.preventDefault();
//   const name = document.getElementById('name') as HTMLInputElement;
//   const email = document.getElementById('email') as HTMLInputElement;
//   const pw = document.getElementById('pw') as HTMLInputElement;
//   if (!name || !email || !pw)
//     return;
//   registerUser(registerURL, headerRegisterRequest(name.value, email.value, pw.value));
// }
// // Initialize on DOM load
// document.addEventListener("DOMContentLoaded", function () {
//   const form = document.getElementById("register-form");
//   if (!form) return;
//   form.addEventListener("submit", registerSubmitEvent);
// });
// public/js/register.ts
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
            };
            try {
                const res = yield fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                const data = yield res.json();
                if (res.ok) {
                    alert('Registered successfully');
                    // Optionally: redirect or load another view
                }
                else {
                    alert(`Error: ${data.message}`);
                }
            }
            catch (err) {
                console.error('Registration failed:', err);
            }
        }));
    }
});
