// login.ts

const loginURL:string = "https://" + currentUrl + ':' + currentPort + '/api/login';
var local_user:string;

// json object for login request
const headerLoginRequest = (uname: string, pw: string ) => ({
  method: 'POST',
  headers: {"Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: uname,
    password: pw,
  }),
})

// fetch request to login
async function login(url:string,  header:any){
  
  await fetch(url, header)
    .then(response => response.json())
    .then((data) => {
      localStorage.setItem("token", data.token);
      console.log(localStorage.getItem("token"));
    })
    .catch((error) => {      
      console.error('Error:', error);
    });
}

// Events
function submitEvent(event: any)
{
  event.preventDefault(); // Prevent default form submission
  const uname = document.getElementById('uname') as HTMLInputElement;
  local_user = uname.value;
  const pw = document.getElementById('pw') as HTMLInputElement;
  if (!uname || !pw) 
    return;
  login(loginURL, headerLoginRequest(uname.value, pw.value));
}


document.addEventListener("DOMContentLoaded", function () {
  // socket_connect();
  send_login();
});

function send_login() {
  const form = document.getElementById("form");
  if (!form) 
    return;
  form.addEventListener("submit", submitEvent);
}

