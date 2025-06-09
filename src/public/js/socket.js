"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var socket;
// TODO: do something with event parameter
function wsEvent() {
    renderLobby();
    // listclick();
    socket = new WebSocket('wss://' + currentRoot + '/api/remote');
    socket.onopen = function (event) {
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
function parseIncommingSocketMsg(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // const jsonData = JSON.parse(data);
        try {
            if (!data.users && !data.type)
                throw new Error("wrong data format server error");
            if (data.users != null)
                updateLobbyUsers(data);
            else if (data.type == 'invite')
                IncomingInvitationAlert(data);
            else if (data.type == 'startgame')
                yield launchPongRemote(() => { load_script_remote(); }, data);
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
    });
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
        data.forEach((item) => {
            UpdateActualFriends(item);
        });
    };
}
window.addEventListener('hashchange', () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});
