// // login.ts
// const loginURL:string = "https://" + currentUrl + ':' + currentPort + '/api/login';
var local_user: string;
var username: any;

function login() {
	const formElement = document.getElementById("login-form") as HTMLFormElement;
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
					errorMsg.textContent = "Welcome!";
					if (formData.get("name"))
						username = formData.get("name");
					// Corrected: fetch avatar and update it
					fetch("/api/avatar")
						.then(response => response.json())
						.then(data => {
							if (data.avatarUrl) {
								updateUserAvatar(data.avatarUrl);
							}
						})
						.catch(err => {
							console.error("Error fetching avatar:", err);
						});
				}
			}
			catch (e) {
				errorMsg.textContent = "Unexpected error";
			}
		}
	};
	xhttp.open("POST", "/api/login", true);
	console.log(formData);
	xhttp.send(formData);
}
