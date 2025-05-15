// // // Construct the register URL dynamically
const currentUrl = window.location.hostname;
const currentPort = window.location.port;

// // public/js/register.ts
// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.querySelector('form');

//   if (form) {
//     form.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const formData = new FormData(form);

//       const payload = {
//         name: formData.get('name'),
//         email: formData.get('email'),
//         password: formData.get('password'),
//       };

//       try {
//         const res = await fetch('/api/register', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//         });

//         const data = await res.json();
//         if (res.ok) {
//           alert('Registered successfully');
        
//         } else {
//           alert(`Error: ${data.message}`);
//         }
//       } catch (err) {
//         console.error('Registration failed:', err);
//       }
//     });
//   }
// });


// Pierre

// const headerRegister = (uname: string, pw: string , mail: string ) => ({
//   method: 'POST',
//   headers: {"Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     username: uname,
//     email: mail,
//     password: pw,
//     //avatar: 
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

/**
 * @brief Register a new user if not exist
 */
function register() {
	const formElement = document.getElementById("register-form") as HTMLFormElement;
	if (!formElement)
		return ;
	const formData = new FormData(formElement);
	const xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 400) {
			// setFormInfoMsg(this.responseText);
		}
		if (this.readyState == 4 && this.status == 200) {
			// getLoginView("User registered");
			// setFormInfoMsg("User registered");
		}
	};
	xhttp.open("POST", "/api/register", true);
  console.log(formData);
	xhttp.send(formData);
}