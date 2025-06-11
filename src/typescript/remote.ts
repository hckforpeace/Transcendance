const currentRoot = currentUrl + ":" + currentPort;
var playerSide:string;
var gameId: number;
var truePong: boolean = false;
var local_username: string;
var opponent: string;

function IncomingInvitationAlert(data: any)
{
  if (confirm('PlayerRemote: ' + data.username + ' is inviting you to play !'))
    socket.send(JSON.stringify({type: 'accept', userId: data.userId}));
  else
    socket.send(JSON.stringify({type: 'refuse', userId: data.userId}));
}

async function launchPongRemote(data: any): Promise<void> {
  navigateTo('/pong_remote');
  gameId = data.gameid;
  playerSide = data.side;
  opponent = data.opponent;
  local_username = data.username;
  if (data.truePong == 'true')
    truePong = true;
}

function moveBall(data:any)
{
  game_remote.ball.pos.x = Number(data.x);
  game_remote.ball.pos.y = Number(data.y); 
}

function moveOpponent(data:any)
{
  var type = data.type;
  var dir = data.direction;

  if (type == 'pressed') {
    if (dir == 'up') {
      if (playerSide == 'p1')
        p2_upPressed_remote = true;
      else
        p1_upPressed_remote = true;
    }
    else {
      if (playerSide == 'p1')
        p2_downPressed_remote = true;
      else
        p1_downPressed_remote = true;
    } 
  } else {
    if (dir == 'up') {
      if (playerSide == 'p1')
        p2_upPressed_remote = false;
      else
        p1_upPressed_remote = false;
    }
    else {
      if (playerSide == 'p1')
        p2_downPressed_remote = false;
      else
        p1_downPressed_remote = false;
    }
  }
}




function sendInvitation(id: any) {
  console.log('I am caaled the id is :' + id);
  // var para = document.getElementById(id) as HTMLParagraphElement 
  socket.send(JSON.stringify({ type: 'invite', userId: id}));
}


function updateLobbyUsers(data: any)
{
  var content_div = document.getElementById('content-div');
  if (!content_div)
    throw new Error('missing content_div ')
  if (data.users === undefined)
    return;

  // const numberofusers = data.users.length;
  
  var users_tag = document.getElementById('users_list');
  if (!users_tag)
    throw new Error('li not found');
  users_tag.innerHTML = '';
  for (const user of data.users)
  {
    let element = document.createElement('p');
    element.id =  user.id; 
    element.innerHTML = user.username;
    element.classList.add("flex", "justify-center", "py-2", "border-b", "cursor-pointer", "peer-checked:bg-blue-100", "transition-colors", "rounded", "text-lg", "font-medium")
    element.setAttribute('onclick', 'sendInvitation(this.id)')
    element.style.cursor = 'pointer';
    users_tag.appendChild(element);
  }
}

document.addEventListener("DOMContentLoaded", function () {
});

async function fetchPong() {
  await fetch("/html/pong.html")
    .then(response => response.text())
    .then(html => {
    	injectViewToContentDiv(html);
      // const contentDiv = document.getElementById('content-div') as HTMLDivElement;
      // contentDiv.innerHTML = html;      // injectViewToContentDiv(html);
    })
    .catch((error) => {
      console.error("Error:", error);
    }); 
}

