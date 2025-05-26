"use strict";
// // // Construct the register URL dynamically
/**
 * @brief Register a new user if not exist
 */
function register() {
    const formElement = document.getElementById("register-form");
    if (!formElement)
        return;
    const errorMsg = document.getElementById("form-error-msg");
    if (!errorMsg)
        return;
    errorMsg.textContent = ""; // Reset previous error
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
                    errorMsg.style.color = "green";
                    errorMsg.textContent = "User registered successfully!";
                }
            }
            catch (e) {
                errorMsg.textContent = "Unexpected errro";
            }
        }
    };
    xhttp.open("POST", "/api/register", true);
    // console.log(formData);
    xhttp.send(formData);
}
function previewAvatar(event) {
    const input = event.target;
    const preview = document.getElementById('avatar-preview');
    if (!input || !input.files || !preview)
        return;
    const file = input.files[0];
    if (!file) {
        preview.src = "";
        preview.classList.add('hidden');
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        if (!e.target || !preview)
            return;
        preview.src = e.target.result;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}
