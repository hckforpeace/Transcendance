"use strict";
function updateUserAvatar(avatarUrl) {
    const profileImg = document.getElementById('profile');
    if (!profileImg)
        return;
    profileImg.src = avatarUrl || '/images/avatar.jpg';
}
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
