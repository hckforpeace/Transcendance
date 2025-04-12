const currentUrl = window.location.hostname;
const currentPort = window.location.port;
const currentRoot = currentUrl + ":" + currentPort;
var socket: WebSocket;
var playerSide:string;
var gameId: number;
var opponent: string;
var truePong: boolean = false;

function IncomingInvitationAlert(data: any)
{
  if (confirm('Player: ' + data.user + ' is inviting you to play !'))
    socket.send(JSON.stringify({type: 'accept', user: data.src, src: local_user}));
  else
    socket.send(JSON.stringify({type: 'refuse', user: data.src, src: local_user}));
}

function launchPongRemote(data:any)
{
  gameId = data.gameid;
  playerSide = data.side;
  opponent = data.opponent;
  if (data.truePong == 'true')
    truePong = true;
  fetchPong();
}

function moveBall(data:any)
{
  game.ball.pos.x = Number(data.x);
  game.ball.pos.y = Number(data.y); 
  console.log("ball pos x: " + game.ball.pos.x);
  console.log("ball pos y: " + game.ball.pos.y);
  // ball.style.top = data.y + 'px';

}

function moveOpponent(data:any)
{
  var type = data.type;
  var dir = data.direction;

  if (type == 'pressed') {
    if (dir == 'up') {
      if (playerSide == 'p1')
        p2_upPressed = true;
      else
        p1_upPressed = true;
    }
    else {
      if (playerSide == 'p1')
        p2_downPressed = true;
      else
        p1_downPressed = true;
    } 
  } else {
    if (dir == 'up') {
      if (playerSide == 'p1')
        p2_upPressed = false;
      else
        p1_upPressed = false;
      // p2_upPressed = false;
    }
    else {
      if (playerSide == 'p1')
        p2_downPressed = false;
      else
        p1_downPressed = false;
      // p2_downPressed = false;
    }
  }
  // console.log("p2_upPressed:&&  " + p2_upPressed);
  // console.log("p2_downPressed: " + p2_downPressed);
}

function parseIncommingSocketMsg(data: any)
{
  // const jsonData = JSON.parse(data);
  try {
    if (!data.users && !data.type)
      throw new Error("wrong data format server error");
    if (data.users != null)
      updateLobbyUsers(data); 
    else if (data.type == 'invite')
      IncomingInvitationAlert(data);
    else if (data.type == 'startgame')
      launchPongRemote(data); 
    else if (data.type == 'pressed' || data.type == 'released')
      moveOpponent(data); 
    else if (data.type == 'moveBall')
      moveBall(data);
  }
  catch (error)
  {
    console.log(error);
  }
}

function listclick()
{
  document.getElementById('users_list')?.addEventListener('click', function (event) {
    try {
      const listItem = event.target as HTMLElement;
      if (!listItem)
        throw new Error('li not found');
      const user = listItem.closest('li');
      if (!user)
        throw new Error('usli value not defined not found');
      // console.log();
      socket.send(JSON.stringify({ type: 'invite', user: user.innerHTML, src: local_user }));
    }
    catch (error) {
      console.log(error);
    }
  })
}

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

function updateLobbyUsers(data: any)
{
  var content_div = document.getElementById('content-div');
  if (!content_div)
    throw new Error('missing content_div ')
  if (data.users === undefined)
    return;

  const numberofusers = data.users.length;
  
  var users_tag = document.getElementById('users_list');
  if (!users_tag)
    throw new Error('li not found');
  users_tag.innerHTML = '';
  for (let i = 0; i < numberofusers; i++)
  {
    let element = document.createElement('li');
    element.innerHTML = data.users[i];
    users_tag.appendChild(element);
  }
}

function renderLobby()
{
  try
  {
    var content_div = document.getElementById('content-div');
    if (!content_div)
      throw new Error('missing content_div ')
    content_div.innerHTML = '';
    var list = document.createElement("ul");
    list.id = 'users_list';
    content_div.appendChild(list);
  
    var request_btn = document.createElement('input');
    request_btn.type = 'button';
    request_btn.value = 'send invitation';
    request_btn.id = 'request';
    content_div.appendChild(request_btn);    
  }
  catch (error)
  {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  socket_connect();
});

async function fetchPong() {
  await fetch("https://" + currentUrl + ":" + currentPort + "/api/pong", {
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
}

// TODO: do something with event parameter
function wsEvent(event: any) 
{
  console.log(currentRoot);
  socket = new WebSocket('wss://' + currentRoot + '/api/remote', localStorage.getItem("token")?.toString());
  socket.onopen = function (event) {
    renderLobby();
    listclick();
  };

  socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    // if (!data)
    //   return ;
    console.log('received: ' + data);
    parseIncommingSocketMsg(data);
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
    console.log('connection refused');
  };

}

function socket_connect() {
  const remote = document.getElementById("start") ;
  if (!remote)
    return;
  remote.addEventListener("click", wsEvent);
}
