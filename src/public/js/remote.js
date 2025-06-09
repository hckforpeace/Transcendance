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
const currentRoot = currentUrl + ":" + currentPort;
var playerSide;
var gameId;
var truePong = false;
var local_username;
var opponent;
function IncomingInvitationAlert(data) {
    if (confirm('PlayerRemote: ' + data.username + ' is inviting you to play !'))
        socket.send(JSON.stringify({ type: 'accept', userId: data.userId }));
    else
        socket.send(JSON.stringify({ type: 'refuse', userId: data.userId }));
}
function launchPongRemote(callback, data) {
    return __awaiter(this, void 0, void 0, function* () {
        gameId = data.gameid;
        playerSide = data.side;
        opponent = data.opponent;
        local_username = data.username;
        if (data.truePong == 'true')
            truePong = true;
        yield fetchPong();
        setTimeout(callback, 0);
        ;
    });
}
function moveBall(data) {
    game_remote.ball.pos.x = Number(data.x);
    game_remote.ball.pos.y = Number(data.y);
    // console.log("ball pos x: " + game.ball.pos.x);
    // console.log("ball pos y: " + game.ball.pos.y);
}
function moveOpponent(data) {
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
    }
    else {
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
// function listclick()
// {
//   document.getElementById('users_list')?.addEventListener('click', function (event) {
//     try {
//       const listItem = event.target as HTMLElement;
//       if (!listItem)
//         throw new Error('li not found');
//       const user = listItem.closest('p');
//       if (!user)
//         throw new Error('usli value not defined not found');
//       console.log(user.innerHTML);
//       socket.send(JSON.stringify({ type: 'invite', user: user.innerHTML, src: local_user }));
//     }
//     catch (error) {
//       console.log(error);
//     }
//   })
// }
function sendInvitation(id) {
    console.log('I am caaled the id is :' + id);
    // var para = document.getElementById(id) as HTMLParagraphElement 
    socket.send(JSON.stringify({ type: 'invite', userId: id }));
}
// function changeRegion()
// {
//     var tag = document.getElementById("dynamic-script") as HTMLScriptElement;
//     if (!tag) {
//       return
//     }
//     tag.remove(); // remove the old script tag
//   
//     var newTag = document.createElement("script");
//     newTag.id = "dynamic-script";
//     newTag.type = "text/javascript";
//     newTag.src = 'js/pong.js';
//     var footer = document.head;
//     console.log(  "change region");
//     if (!footer) {
//       console.log(  "footer failed");
//       return ;
//     }
//     footer.appendChild(newTag);
//     console.log("script loaded");
// }
function updateLobbyUsers(data) {
    var content_div = document.getElementById('content-div');
    if (!content_div)
        throw new Error('missing content_div ');
    if (data.users === undefined)
        return;
    // const numberofusers = data.users.length;
    var users_tag = document.getElementById('users_list');
    if (!users_tag)
        throw new Error('li not found');
    users_tag.innerHTML = '';
    for (const user of data.users) {
        let element = document.createElement('p');
        element.id = user.id;
        element.innerHTML = user.username;
        element.classList.add("flex", "justify-center", "py-2", "border-b", "cursor-pointer", "peer-checked:bg-blue-100", "transition-colors", "rounded", "text-lg", "font-medium");
        element.setAttribute('onclick', 'sendInvitation(this.id)');
        element.style.cursor = 'pointer';
        users_tag.appendChild(element);
    }
}
function renderLobby() {
    try {
        var content_div = document.getElementById('content-div');
        if (!content_div)
            throw new Error('missing content_div ');
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
        });
    }
    catch (error) {
        console.log(error);
    }
}
document.addEventListener("DOMContentLoaded", function () {
});
function fetchPong() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch("/html/pong.html")
            .then(response => response.text())
            .then(html => {
            injectViewToContentDiv(html);
            // const contentDiv = document.getElementById('content-div') as HTMLDivElement;
            // contentDiv.innerHTML = html;      // injectViewToContentDiv(html);
        })
            .catch((error) => {
            console.error("Error:", error);
        });
    });
}
function loadRemoteLobby() {
    // renderLobby();
    wsEvent();
}
