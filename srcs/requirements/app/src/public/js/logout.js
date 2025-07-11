"use strict";
function logout() {
    fetch("/api/logout", {
        method: "GET",
        credentials: "include", // Important: include cookies
    })
        .then(response => {
        if (response.ok) {
            updateUserAvatar('/images/avatar.jpg'); // Optionally clear avatar
            navigateTo('/');
        }
        else {
            console.error("Logout failed");
        }
    })
        .catch(err => {
        console.error("Logout error:", err);
    });
}
