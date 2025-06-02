// // login.ts

// const loginURL:string = "https://" + currentUrl + ':' + currentPort + '/api/login';
var local_user: string;

// // json object for login request
// const headerLoginRequest = (uname: string, pw: string ) => ({
//   method: 'POST',
//   headers: {"Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     username: uname,
//     password: pw,
//   }),
// })

// // fetch request to login
// async function login(url:string,  header:any){

//   await fetch(url, header)
//     .then(response => response.json())
//     .then((data) => {
//       localStorage.setItem("token", data.token);
//       console.log(localStorage.getItem("token"));
//     })
//     .catch((error) => {      
//       console.error('Error:', error);
//     });
// }

// // Events
// function submitEvent(event: any)
// {
//   event.preventDefault(); // Prevent default form submission
//   const uname = document.getElementById('uname') as HTMLInputElement;
//   local_user = uname.value;
//   const pw = document.getElementById('pw') as HTMLInputElement;
//   if (!uname || !pw) 
//     return;
//   login(loginURL, headerLoginRequest(uname.value, pw.value));
// }

// // TODO: do something with event parameter
// // function wsEvent(event: any) {
// //   console.log(currentRoot);
// //   const socket = new WebSocket('wss://' + currentRoot + '/api/remote');
// //   socket.onopen = function (event) {
// //     socket.send("Hello hdhdhd i am gay!");
// //     };
// //   socket.onmessage = function(event) {
// //   console.log(`[message] Data received from server: ${event.data}`);
// //   };

// //   socket.onclose = function(event) {
// //     if (event.wasClean) {
// //       console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
// //     } else {
// //       // par exemple : processus serveur arrêté ou réseau en panne
// //       // event.code est généralement 1006 dans ce cas
// //       console.log('[close] Connection died');
// //     }
// //   };

// //   socket.onerror = function(error) {
// //     console.log(`[error]`);
// //   };
// //   fetchPong();

// // }

// document.addEventListener("DOMContentLoaded", function () {
//   // socket_connect();
//   send_login();
// });

// // async function fetchPong() {
// //   await fetch("https://localhost:8080/api/pong", {
// //     headers: {
// //       Authorization: `Bearer ${localStorage.getItem("token")}`,
// //     },
// //   })
// //     .then(response => response.text())
// //     .then(html => {
// //       var content = document.getElementById("content-div");
// //       if (!content)
// //         throw new Error("Content div not found");
// //       content.innerHTML = html;
// //       changeRegion();
// //     })
// //     .catch((error) => {
// //       console.error("Error:", error);
// //     }); 
// // }

// function send_login() {
//   const form = document.getElementById("form");
//   if (!form) 
//     return;
//   form.addEventListener("submit", submitEvent);
// }

// // function socket_connect() {
// //   const remote = document.getElementById("start") ;
// //   if (!remote)
// //     return;
// //   remote.addEventListener("click", wsEvent);
// // }


// // establish a connection to the server
// // const socket = new WebSocket("ws://localhost:8080");

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
