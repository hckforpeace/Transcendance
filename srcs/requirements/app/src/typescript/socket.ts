var socket: WebSocket;

// TODO: do something with event parameter
function wsEvent() 
{
  // listclick();
  socket = new WebSocket('wss://' + currentRoot  + '/api/remote');
  socket.onopen = function (event) {
  };

  socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    console.log('received: ' + data);
    parseIncommingSocketMsg(data);
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('[close] Connection died');
    }
  };

  socket.onerror = function(error) {
    console.log('connection refused');
  };
}


async function parseIncommingSocketMsg(data: any)
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
      await launchPongRemote(data); 
    else if (data.type == 'pressed' || data.type == 'released')
      moveOpponent(data); 
    else if (data.type == 'moveBall')
      moveBall(data);
    else if (data.type == 'opponentdisconnect')
      alert("opponent " + data.opponent + " was disconnected");
  }
  catch (error)
  {
    console.log(error);
  }
}

function ProfileSocketConnection() {
  socket = new WebSocket('wss://' + currentRoot + '/api/profile/socket');

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    data.forEach((item: any) => { 
      UpdateActualFriends(item); 
    })
  };
}

window.addEventListener('hashchange', () => {
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
});

