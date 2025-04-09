let Games = new Set();
let Players = new Map();
var PlayerId = 0;

class Player {
  constructor(Token, PlayerID, username, socket) {
    this._Token = Token;
    this._username = username;
    this._PlayerID = PlayerID;
    this._socket = socket;
  }

  get username() {
    return this._username;
  }

  set username(val) {
    this._username = val;
  }

  set Token(val) {
    this._Token = val;
  }

  set PlayerId(val) {
    this._PlayerID = val;
  }

  set socket(val) {
    this._socket = val;
  }


  get socket() {
    return (this._socket);
  }

}

class Game {
  constructor(){
    p1 = null;
    p2 = null;
  }
}

function addPlayer(uid, Token, username, socket){
  let npalyer = new Player(Token, PlayerId, username, socket);
  Players.set(uid, npalyer);
  PlayerId++;
}

function removePlayer(uid){
  Players.delete(uid);
}

function findPlayer(uname)
{
  var p = null;
  Players.forEach((values, keys) => {
    console.log('find player:', values.username, 'uname:', uname);
    if (values.username === uname)
    {
       p = values;
    }
  })

  return (p);
}

function invitePlayer(data, socket){
  let invited_player;
  let src_player;

  invited_player = findPlayer(data.user);
  src_player = findPlayer(data.src);
}

function getUsers(id){
  
  var usersList = {};
  var key = 'users';
  usersList[key] = [];

  Players.forEach((values, keys) => {
    if (keys != id)
      usersList[key].push(values.username);
  })
  return (JSON.stringify(usersList));
}

function broadcast()
{
  Players.forEach((values, keys) => {
      values.socket.send(getUsers(keys));
  })
}

function sendCurrentUsers()
{
  broadcast();
}

function isValidGame(game){
  if(game.p1 == null || game.p2 == null)
    return false;
  return true;
}

export default {addPlayer, getUsers, removePlayer, sendCurrentUsers, invitePlayer}; 
