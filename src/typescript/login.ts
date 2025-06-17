// // login.ts
// const loginURL:string = "https://" + currentUrl + ':' + currentPort + '/api/login';

function load2faView(): void {
	const	template2fa = document.getElementById("2fa_template") as HTMLTemplateElement | null;
	const	form = document.getElementById("login-form") as HTMLElement | null;

	if (!template2fa || !form)
		return ;
	const	elem2fa = template2fa.content.cloneNode(true) as DocumentFragment;
	form.innerHTML = '';
	form.appendChild(elem2fa);
    const inputElement = document.getElementById('2fa-input') as HTMLInputElement;

    if (!inputElement) {
        console.error('2FA input element not found');
        return;
    }

	inputElement.addEventListener('input', (event) => {
	  const target = event.target as HTMLInputElement;
	  target.value = target.value.replace(/\D/g, ''); // Remove non-digit characters

    // Truncate input to 6 characters if it exceeds the limit
      if (target.value.length > 6) {
        target.value = target.value.slice(0, 6);
      }
      if (inputElement.value.length === 6) {
          console.log('6 characters entered:', inputElement.value);
          send2faCode();
    	  inputElement.disabled = true; // Make the field uneditable
    	  inputElement.style.backgroundColor = '#e0e0e0'; // Change background color to indicate disabled state
    	  inputElement.style.color = '#888'; // Change text color for visual indication
          // Proceed with further logic
        }
	});

    inputElement.addEventListener('input', () => {
	});
};

function send2faCode() {
	const formElement = document.getElementById("login-form") as HTMLFormElement;
	if (!formElement)
		return;
	const errorMsg = document.getElementById("form-error-msg");
	if (!errorMsg)
		return;
	errorMsg.textContent = ""; // Reset previous error
	errorMsg.style.color = "red";
	const formData = new FormData(formElement);
	formData.append("user_id", localStorage.getItem("user_id") || "");
	const xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			try
			{
				if (this.status === 400 || this.status === 500)
				{
					const response = JSON.parse(this.responseText);
				 	errorMsg.textContent = response.error || "An error occurred.";
				}
				if (this.status === 200)
				{
                    // errorMsg.style.color = "green";
                    // errorMsg.textContent = "Welcome!";
					console.log("Valid 2fa Code");
				}
			}
			catch (e)
			{
				errorMsg.textContent = "Unexpected error";
			}
		}

	};

	xhttp.open("POST", "/api/2fa", true);
	console.log(formData);
	xhttp.send(formData);
}

function check2faInput() {
    const inputElement = document.getElementById('2fa-input') as HTMLInputElement;

    if (!inputElement) {
        console.error('2FA input element not found');
        return;
    }

    inputElement.addEventListener('input', () => {
        if (inputElement.value.length === 6) {
            console.log('6 characters entered:', inputElement.value);

            // Proceed with further logic
        }
    });
}

function login() {
	const formElement = document.getElementById("login-form") as HTMLFormElement;
	if (!formElement)
		return;
	const userField = document.getElementById("username") as HTMLInputElement | null;
	const userValue = userField ? userField.value : "";
	localStorage.setItem("user_id", userValue);
	const errorMsg = document.getElementById("form-error-msg");
	if (!errorMsg)
		return;
	errorMsg.textContent = ""; // Reset previous error
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
				if (this.status === 200)
				{
                    // errorMsg.style.color = "green";
                    // errorMsg.textContent = "Welcome!";
					load2faView();
// =======
// 				if (this.status === 200) {
// 					isLoggedIn = true;
// 					errorMsg.style.color = "green";
// 					errorMsg.textContent = "Welcome!";
// 					// Corrected: fetch avatar and update it
// 					fetch("/api/avatar")
// 						.then(response => response.json())
// 						.then(data => {
// 							if (data.avatarUrl) {
// 								updateUserAvatar(data.avatarUrl);
// 							}
// 						})
// 						.catch(err => {
// 							console.error("Error fetching avatar:", err);
// 						});
// 					navigateTo('/');
// >>>>>>> main
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
    navigateTo('/')
  }
  else if (res.status === 400)
  {
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


