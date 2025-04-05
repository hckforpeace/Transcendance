// login.ts

const currentUrl = window.location.hostname;
const currentPort = window.location.port;
const currentRoot = currentUrl + ":" + currentPort;
const loginURL:string = "https://localhost:8080/api/login"

function changeRegion()
{
    var tag = document.getElementById("dynamic-script") as HTMLScriptElement;
    if (!tag) {
      return
    }
    tag.remove(); // remove the old script tag
  
    var newTag = document.createElement("script");
    newTag.id = "dynamic-script";
    newTag.type = "text/javascript";
    newTag.src = 'js/pong.js';
    var footer = document.getElementById("footer");
    if (!footer) {
      return ;
    }
    footer.appendChild(newTag);
}

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
  const pw = document.getElementById('pw') as HTMLInputElement;
  if (!uname || !pw) 
    return;
  login(loginURL, headerLoginRequest(uname.value, pw.value));
}

// TODO: do something with event parameter
function wsEvent(event: any) {
  console.log(currentRoot);
  const socket = new WebSocket('wss://' + currentRoot + '/api/remote');
  socket.onopen = function (event) {
    socket.send("Hello hdhdhd i am gay!");
    };
  socket.onmessage = function(event) {
  console.log(`[message] Data received from server: ${event.data}`);
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // par exemple : processus serveur arrêté ou réseau en panne
      // event.code est généralement 1006 dans ce cas
      console.log('[close] Connection died');
    }
  };

  socket.onerror = function(error) {
    console.log(`[error]`);
  };
  fetchPong();

}

document.addEventListener("DOMContentLoaded", function () {
  socket_connect();
  send_login();
});

async function fetchPong() {
  await fetch("https://localhost:8080/api/pong", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then(response => response.text())
    .then(html => {
      var content = document.getElementById("content-div");
      if (!content)
        throw new Error("Content div not found");
      content.innerHTML = html;
      changeRegion();
    })
    .catch((error) => {
      console.error("Error:", error);
    }); 
  //     if (response.ok) {
  //       console.log("Ping successful!");
  //       
  //     } else {
  //       console.error("Ping failed!");
  //     }
  //   })
}

function send_login() {
  const form = document.getElementById("form");
  if (!form) 
    return;
  form.addEventListener("submit", submitEvent);
}

function socket_connect() {
  const remote = document.getElementById("start") ;
  if (!remote)
    return;
  remote.addEventListener("click", wsEvent);
}


// establish a connection to the server
// const socket = new WebSocket("ws://localhost:8080");
