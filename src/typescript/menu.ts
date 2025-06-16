function updateUserAvatar(avatarUrl: string) {
	const profileImg = document.getElementById('profile') as HTMLImageElement | null;

	if (!profileImg) return;
	profileImg.src = avatarUrl || '/images/avatar.jpg';
}

document.addEventListener('DOMContentLoaded', () => {
	const registerBtn = document.getElementById('tournament');

	if (registerBtn) {
		registerBtn.addEventListener('click', async () => {
			try {
				// const res = await fetch('/api/register', {});
				// .then
				// const html = await res.text();
				await fetch("/api/tournament")
					.then(response => response.text())
					.then(html => {
						var content = document.getElementById("content-div");
						if (!content)
							throw new Error("Content div not found");
						content.innerHTML = html;
					})
				// Optionally load related JS (like form handling)
				//import('./public/js/register.js');
			} catch (err) {
				console.error('Error loading tournament view:', err);
			}
		});
	}
});

// document.addEventListener('DOMContentLoaded', () => {
//   const loginBtn = document.getElementById('profile');


function getProfileView(callback: () => void) {
    fetch('/html/profile.html')
        .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return response.text(); // ✅ return the parsed JSON
    })
        .then(data => {
        injectViewToContentDiv(data);
        setTimeout(callback, 0)
    });
}

// function loadProfileView() {
//   getProfileView( () => {
//     renderProfile();
//   });
// }
