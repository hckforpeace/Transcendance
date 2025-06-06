const currentRoot = currentUrl + ":" + currentPort;
var playerSide:string;
var gameId: number;
var opponent: string;
var truePong: boolean = false;

function IncomingInvitationAlert(data: any)
{
  if (confirm('Player: ' + data.src + ' is inviting you to play !'))
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
    }
    else {
      if (playerSide == 'p1')
        p2_downPressed = false;
      else
        p1_downPressed = false;
    }
  }
}


function listclick()
{
  document.getElementById('users_list')?.addEventListener('click', function (event) {
    try {
      const listItem = event.target as HTMLElement;
      if (!listItem)
        throw new Error('li not found');
      const user = listItem.closest('p');
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
    var footer = document.head;
    console.log(  "change region");
    if (!footer) {
      console.log(  "footer failed");
      return ;
    }
    footer.appendChild(newTag);
    console.log("script loaded");
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
    let element = document.createElement('p');
    element.classList.add('text-center'); 
    element.innerHTML = data.users[i];
    element.style.cursor = 'pointer';
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

    fetch('/html/lobby.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        return response.text(); // ✅ return the parsed JSON
      })
      .then(data => {
        injectViewToContentDiv(data);
        // socket_connect();
      })
  }
  catch (error)
  {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
});

async function fetchPong() {
  await fetch("/api/pong", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then(response => response.text())
    .then(html => {
      var content = document.getElementById("content-div");
      if (!content)
        throw new Error("Content div not found");
      content.className = "";
      content.innerHTML = html;
      // changeRegion();
    })
    .catch((error) => {
      console.error("Error:", error);
    }); 
}

function loadRemoteLobby() {
  // renderLobby();
  wsEvent();
}
