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

//   if (loginBtn) {
//     loginBtn.addEventListener('click', async () => {
//       try {
//         // const res = await fetch('/api/register', {});
//         // .then
//         // const html = await res.text();
//         await fetch("/api/stats")
//           .then(response => response.text())
//           .then(html => {
//       var content = document.getElementById("content-div");
//       if (!content)
//         throw new Error("Content div not found");
//       content.innerHTML = html;
//       })
//         // Optionally load related JS (like form handling)
//         //import('./public/js/register.js');
//       } catch (err) {
//         console.error('Error loading login view:', err);
//       }
//     });
//   }
// });

// export function updateUserAvatar(userName: string) {
//   const profileImg = document.getElementById('profile') as HTMLImageElement | null;
//   if (!profileImg) return;

//   const avatarUrl = `/images/${userName}.jpg`;

//   profileImg.src = avatarUrl;

//   profileImg.onerror = () => {
//     profileImg.src = '/images/avatar.jpg';
//   };
// }
