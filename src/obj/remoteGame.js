let Games = new Set();
let Players = new Set();
var PlayerId = 0;

class Player {
    constructor(Token, PlayerID, username) {
        this.Token = Token;
        this.username = username;
        this.PlayerID = PlayerID;
    }
}

class Game {
  constructor(){
    p1 = null;
    p2 = null;
  }
}

function addPlayer(Token){
  let npalyer = new Player(Token, PlayerId);
  PlayerId++;
  Players.add(npalyer);
}

function isValidGame(game){
  if(game.p1 == null || game.p2 == null)
    return false;
  return true;
}

export default {addPlayer} ;
