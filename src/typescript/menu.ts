document.addEventListener('DOMContentLoaded', () => {
	const registerBtn = document.getElementById('home');

	if (registerBtn) {
		registerBtn.addEventListener('click', async () => {
			try {
				// const res = await fetch('/api/register', {});
				// .then
				// const html = await res.text();
				await fetch("/home")
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
				console.error('Error loading register view:', err);
			}
		});
	}
});

function updateUserAvatar(avatarUrl: string) {
	const profileImg = document.getElementById('profile') as HTMLImageElement | null;

	if (!profileImg) return;

	profileImg.src = avatarUrl || '/images/avatar.jpg';
}


