let Games = new Map();
let Players = new Map();

class Player {
  constructor(Token, PlayerID, username, socket) {
    this._Token = Token;
    this._truePlayer = 'false';
    this._username = username;
    this._score = null;
    this._PlayerId = PlayerID;
    this._socket = socket;
    this._pendingInvite = false;
    this._inGame = null;
  }

  get score() {
    return this._score;
  }
  
  get PlayerId() {
    return this._PlayerId;
  }

  get pendingInvite() {
    return this._pendingInvite;
  }

  set pendingInvite(val) {
    this._pendingInvite = val;
  }

  get truePlayer() {
    return this._truePlayer;
  }

  set truePlayer(val) {
    this._truePlayer = val;
  }

  get inGame() {
    return this._inGame;
  }

  set inGame(val)
  {
    this._inGame = val;
  }

  get username() {
    return this._username;
  }

  set username(val) {
    this._username = val;
  }

  set score(val) {
    this._score = val;
  }

  set Token(val) {
    this._Token = val;
  }

  set PlayerId(val) {
    this._PlayerId = val;
  }

  set socket(val) {
    this._socket = val;
  }


  get socket() {
    return (this._socket);
  }

}

class Game {
  constructor(p1, p2){
    this._p1 = p1;
    this._p2 = p2;
  }
  
  get p1(){
    return this._p1;
  }

  set p1(val){
    this._p1 = val
  }

  get p2(){
    return this._p2;
  }

  set p2(val){
    this._p2 = val
  }
}

function addPlayer(uid, Token, username, socket){
  let npalyer = new Player(Token, uid, username, socket);
  Players.set(uid, npalyer);
}

function moveBall(data) {
  
  var gameid = data.gameid;
  var game;
  try
  {
    if (!gameid) 
      throw new Error("wrong parameters");
    game = Games.get(gameid);
    if (!game)
      throw new Error("wrong parameters");
    if (game.p1.truePlayer == 'false')
      game.p1.socket.send(JSON.stringify(data));
    else
      game.p2.socket.send(JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
}

function moveOpponent(data) {
  
  var gameid = data.gameid;
  var opponent = data.opponent;
  var game;
  try
  {
    console.log(data)
    if (!gameid || !opponent)
      throw new Error("wrong parameters");
    console.log('gameid: ' + gameid);
    game = Games.get(gameid);

    if (!game)
      throw new Error("wrong parameters");
    if (game.p1.username == opponent){
      game.p1.socket.send(JSON.stringify(data));
    }
    else if (game.p2.username == opponent) {
      game.p2.socket.send(JSON.stringify(data));
    }
    else
      throw new Error("wrong parameters");
  } catch (error) {
    console.log(error);
    // todo
  }
}

function startGame(data, id, gameId)
{
  var p1, p2;
  var uname1, uname2;
  
  try {

    console.log('id : ' + id);
    p1 = Players.get(id); 
    p2 = Players.get(Number(data.userId));
       
    // p1 = findPlayer(uname1);
    // p2 = findPlayer(uname2);
    p1.pendingInvite = false; 
    p2.pendingInvite = false; 
    uname1 = p1.username;
    uname2 = p2.username;

    if (data.type == 'refuse')
    {
      p1.pendingInvite = false;
      return;
    }

    if (!p1 || !p2)
      throw new Error("wrong data format"); 
    p1.inGame = gameId; 
    p2.inGame = gameId; 
    p1.truePlayer = 'true';

    Games.set(gameId, new Game(p1, p2));

    console.log('gameid: ' + gameId);
    p1.socket.send(JSON.stringify({type: 'startgame',username: uname1, opponent: uname2, gameid: gameId, side: 'p1', truePong: p1.truePlayer}));
    p2.socket.send(JSON.stringify({type: 'startgame',username: uname2,  opponent: uname1, gameid: gameId, side : 'p2', truePong: p2.truePlayer}));

  } catch (error){
    console.log(error);
  }
}

function removePlayer(uid){
  Players.delete(uid);
}

function findPlayer(uname)
{
  var p = null;
  Players.forEach((values, keys) => {
    if (values.username === uname)
       p = values;
  })

  return (p);
}

function invitePlayer(data, InitId ){
  let invited_player;
  let src_player;

  try {
   
    invited_player = Players.get(Number(data.userId));
    src_player = Players.get(InitId);


    if (!invited_player || !src_player)
      throw new Error("players not found")

    if (!invited_player.pendingInvite)
      invited_player.socket.send(JSON.stringify({type: 'invite', username: src_player.username, userId: InitId}));
    invited_player.pendingInvite = true;
  } catch (error) {
    console.log(error);
  }
}

function DisconnectPlayer(id){
  let player = Players.get(id);
  if (player != null)
  {
    if (player.inGame != null)
    {
      var gameid = player.inGame;
      let game = Games.get(player.inGame);
      game.p1.inGame = null; 
      game.p2.inGame = null; 
      if (game.p1 == player) {
        game.p1 = null;
        if (game.p2 != null){
          game.p2.socket.send(JSON.stringify({type: 'opponentdisconnect', opponent: player.username}));
          game.p2 == null;
        }
      }
      else {
        game.p2 = null;
        if (game.p1 != null) {
          game.p1.socket.send(JSON.stringify({type: 'opponentdisconnect', opponent: player.username}));
          game.p1 == null;
        }
      }
      Games.delete(gameid);
    }
    Players.delete(id);
  }
}

function endGame(data, id) {
  var gameid = data.gameid;
  var game;

  try
  {
    if (!gameid) 
      throw new Error("wrong parameters");
    game = Games.get(gameid);
    if (!game)
      throw new Error("wrong parameters");
    if (game.p1.PlayerId == id) {
      if (game.p2.score != null && game.p2.score != data.scoreP2)
        throw new Error("error in score");
      game.p1.score = data.scoreP1;
    } 
    if (game.p2.PlayerId == id) {
      if (game.p1.score != null && game.p1.score != data.scoreP1)
        throw new Error("error in score");
      game.p2.score = data.scoreP2;
    } 
    if (game.p1.score != null && game.p2.score != null) {
      // TODO
      // record the score in the database
    }
    // if (game.) 
  } catch (error) {
    console.log(error);
  } 
}

function getUsers(id){
 
  var usersList = {};
  var key = 'users';
  usersList[key] = [];

  Players.forEach((values, keys) => {
    if (keys != id)
      usersList[key].push({id: values.PlayerId, username: values.username});
  })

  return (JSON.stringify(usersList));
}



function sendCurrentUsers()
{
  var users;
  Players.forEach((values, keys) => {
    users = getUsers(keys);
    console.log('the user ' + values.name + ' should receive: ' + users + ' his socket is: ' + values.socket)
    values.socket.send(users);
  })

}

function isValidGame(game){
  if(game.p1 == null || game.p2 == null)
    return false;
  return true;
}

export default {addPlayer, getUsers, removePlayer, sendCurrentUsers, invitePlayer, startGame, moveOpponent, moveBall, DisconnectPlayer, endGame}; 
