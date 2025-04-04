
// login.ts

const currentUrl = window.location.hostname;
const currentPort = window.location.port;
const currentRoot = currentUrl + ":" + currentPort;

const headerLoginRequest = (uname: string, pw: string ) => ({
  method: 'POST',
  headers: {"Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: uname,
    password: pw,
  }),
})


async function login(url:string,  header:any){
  
  await fetch(url, header)
    .then((response) => {
      if (response.ok) {
        console.log("Login successful!");
      } else {
        console.error("Login failed!");
        throw new Error("Login failed");
      }
    })
}

document.addEventListener("DOMContentLoaded", function () {
  socket_connect();
  const form = document.getElementById("form");
  const url:string = "https://localhost:8080/api/login"

  function logSubmit(event: any)
  {
    event.preventDefault(); // Prevent default form submission
    const uname = document.getElementById('uname') as HTMLInputElement;
    const pw = document.getElementById('pw') as HTMLInputElement;
    if (!uname || !pw) 
      return;
    // console.log(uname.value, pw.innerHTML);
    login(url, headerLoginRequest(uname.value, pw.value));
  }
  if (!form) 
    return;
  form.addEventListener("submit", logSubmit);
});

function socket_connect() {
  const remote = document.getElementById("remote") ;
  if (!remote)
    return;
  function connect(event: any) {
    console.log(currentRoot);
    const socket = new WebSocket('wss://' + currentRoot + '/api/remote');
    socket.onopen = function (event) {
      socket.send("Hello hdhdhd i am gay!");
      };
    socket.onmessage = function(event) {
    alert(`[message] Data received from server: ${event.data}`);
    };

    socket.onclose = function(event) {
      if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // par exemple : processus serveur arrêté ou réseau en panne
        // event.code est généralement 1006 dans ce cas
        alert('[close] Connection died');
      }
    };

    socket.onerror = function(error) {
      alert(`[error]`);
    };

  }
  remote.addEventListener("click", connect);
}


// establish a connection to the server
// const socket = new WebSocket("ws://localhost:8080");
