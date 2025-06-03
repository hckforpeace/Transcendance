"use strict";
var socket;
// TODO: do something with event parameter
function wsEvent(event) {
    var _a;
    socket = new WebSocket('wss://' + currentRoot + '/api/remote', (_a = localStorage.getItem("token")) === null || _a === void 0 ? void 0 : _a.toString());
    socket.onopen = function (event) {
        renderLobby();
        listclick();
    };
    socket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        console.log('received: ' + data);
        parseIncommingSocketMsg(data);
    };
    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        }
        else {
            console.log('[close] Connection died');
        }
    };
    socket.onerror = function (error) {
        console.log('connection refused');
    };
}
// Creates socket connection n
function socket_connect() {
    const remote = document.getElementById("start");
    if (!remote)
        return;
    remote.addEventListener("click", wsEvent);
}
function parseIncommingSocketMsg(data) {
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
        else if (data.type == 'opponentdisconnect')
            alert("opponent " + data.opponent + " was disconnected");
    }
    catch (error) {
        console.log(error);
    }
}
function ProfileSocketConnection() {
    const socket = new WebSocket('wss://' + currentRoot + '/api/profile/socket');
    socket.onopen = () => {
        console.log('WebSocket connected');
    };
    socket.onclose = () => {
        console.log('WebSocket disconnected');
    };
    socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log(data);
        UpdateActualFriends(data);
    };
}
window.addEventListener('hashchange', () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});
