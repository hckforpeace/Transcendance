// // login.ts
// const loginURL:string = "https://" + currentUrl + ':' + currentPort + '/api/login';

function renderAvatar() {
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

function login() {
	const formElement = document.getElementById("login-form") as HTMLFormElement;
	if (!formElement)
		return;
	const errorMsg = document.getElementById("form-error-msg");
	if (!errorMsg)
		return;
	errorMsg.textContent = "";
	errorMsg.style.color = "red";
	const formData = new FormData(formElement);
	const xhttp = new XMLHttpRequest();


	xhttp.onreadystatechange = function () {
		if (this.readyState === 4) {
			try  {
				if (this.status === 400 || this.status === 500) {
					const response = JSON.parse(this.responseText);
					errorMsg.textContent = response.error || "An error occurred.";
				}
				if (this.status === 200) {
					errorMsg.style.color = "green";
					errorMsg.textContent = "Welcome!";
          			renderAvatar();
					navigateTo('/');
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

const displayAvatarMenu = () => {
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


// ***************************************************************************
//                                   Google sign-in
// ***************************************************************************

async function handleCredentialResponse(response: any) {
  const errorMsg = document.getElementById("form-error-msg");
  if (!errorMsg)
  return;
  const res = await fetch('/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ Token: response.credential }),
  });
  if (res.ok) {
    console.log('success')
    renderAvatar();
    //isLoggedIn = true;
    navigateTo('/')
  }
  else if (res.status === 400){
    const response = await res.json();
    console.log(response.error)
    errorMsg.textContent = response.error;
  }
  // Send to backend for verification
}

function oauth2() {
  var btn = document.getElementById("g_id_signin") as HTMLDivElement;
  if (btn) {    google.accounts.id.initialize({
      client_id: "998291091717-69t8ub79jvhdfq195vqtc93buajcgsaf.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
    });
    google.accounts.id.renderButton(
      btn,
      { theme: "outline", size: "large", type: "standard"   })
  }
}

