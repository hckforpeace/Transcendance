var socket: WebSocket;

// TODO: do something with event parameter

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

