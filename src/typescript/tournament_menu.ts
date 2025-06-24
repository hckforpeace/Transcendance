let playerIdCounter = 1;
let player1Alias: string = '';
let player2Alias: string = '';

interface PlayerData {
  id: string;
  alias: string;
}

const players: Record<string, PlayerData> = {};


const player_nbr_val = [2, 4, 8, 16];

function extractPlayerAliases(): void {
  const input1 = document.querySelector('#player-container1 .alias-input') as HTMLInputElement;
  const input2 = document.querySelector('#player-container2 .alias-input') as HTMLInputElement;

  player1Alias = input1?.value.trim() || '';
  player2Alias = input2?.value.trim() || '';
}

/**
 * Initialise les événements, le slider et les joueurs au chargement
 */
function init_tournamentMenu(): void {
  winners.length = 0;
  player1Alias = '';
  player2Alias = '';
  i = 0;
  end_of_tournament_iteration = false;
  end_game = true;
  init_events();
  updatePlayButton();
  resetPlayers();
  set_player_nbr();
  update_player();
}

/**
 * Ajoute les écouteurs d'événements
 */
function init_events() {
  const player_slider = document.getElementById("player_nbr_slider") as HTMLInputElement;
  if (!player_slider) return;

  player_slider.addEventListener("input", update_player);
}

/**
 * Vide les conteneurs et réinitialise le compteur et tableau joueurs
 */
function resetPlayers() {
  const container1 = document.getElementById("player-container1")!;
  const container2 = document.getElementById("player-container2")!;
  container1.innerHTML = "";
  container2.innerHTML = "";
  playerIdCounter = 1;

  // Vide le tableau players
  for (const key in players) {
    delete players[key];
  }
}

/**
 * Met à jour le nombre affiché sous le slider
 */
function set_player_nbr() {
  const slider = document.getElementById("player_nbr_slider") as HTMLInputElement;
  const text_field = document.getElementById("player_nbr") as HTMLParagraphElement;
  if (!slider || !text_field) return;
  text_field.textContent = player_nbr_val[Number(slider.value)].toString();
}

/**
 * Ajoute une paire de joueurs (gauche + droite) avec IDs croissants
 */
function add_two_players() {
  const playerTemplate = document.getElementById("t-player-elem") as HTMLTemplateElement;
  const playerContainer1 = document.getElementById("player-container1") as HTMLDivElement;
  const playerContainer2 = document.getElementById("player-container2") as HTMLDivElement;
  if (!playerTemplate || !playerContainer1 || !playerContainer2) return;

  // Joueur gauche
  const playerLeft = playerTemplate.content.cloneNode(true) as HTMLElement;
  const playerLeftDiv = playerLeft.querySelector(".player-entry") as HTMLDivElement;
  const idLeft = `player_${playerIdCounter++}`;
  playerLeftDiv.id = idLeft;
  playerContainer1.appendChild(playerLeft);
  players[idLeft] = { id: idLeft, alias: "" };

  // Joueur droite
  const playerRight = playerTemplate.content.cloneNode(true) as HTMLElement;
  const playerRightDiv = playerRight.querySelector(".player-entry") as HTMLDivElement;
  const idRight = `player_${playerIdCounter++}`;
  playerRightDiv.id = idRight;
  playerContainer2.appendChild(playerRight);
  players[idRight] = { id: idRight, alias: "" };
}

/**
 * Ajoute n paires de joueurs
 */
function add_player(nbr: number): void {
  for (let i = 0; i < nbr; i++) {
    add_two_players();
  }
}

/**
 * Supprime n paires de joueurs du DOM et du tableau players
 */
function remove_player(nbr: number): void {
  const playerContainer1 = document.getElementById("player-container1") as HTMLDivElement;
  const playerContainer2 = document.getElementById("player-container2") as HTMLDivElement;

  for (let i = 0; i < nbr; i++) {
    // Supprime dernier joueur à gauche
    const lastLeft = playerContainer1.lastElementChild as HTMLElement | null;
    if (lastLeft) {
      const idLeft = lastLeft.querySelector(".player-entry")?.id;
      if (idLeft && players[idLeft]) {
        delete players[idLeft];
      }
      playerContainer1.removeChild(lastLeft);
    }

    // Supprime dernier joueur à droite
    const lastRight = playerContainer2.lastElementChild as HTMLElement | null;
    if (lastRight) {
      const idRight = lastRight.querySelector(".player-entry")?.id;
      if (idRight && players[idRight]) {
        delete players[idRight];
      }
      playerContainer2.removeChild(lastRight);
    }
  }
}

/**
 * Met à jour les joueurs affichés en fonction du slider
 */
function update_player() {
  const slider = document.getElementById("player_nbr_slider") as HTMLInputElement;
  if (!slider)
    return;

  const desired_val = player_nbr_val[Number(slider.value)];
  const half = desired_val / 2;

  const container1 = document.getElementById("player-container1") as HTMLDivElement;
  const container2 = document.getElementById("player-container2") as HTMLDivElement;
  if (!container1 || !container2)
    return;

  resetPlayers();

  const currentPlayersCount = container1.children.length + container2.children.length;

  if (desired_val > currentPlayersCount) {
    // Ajouter les joueurs manquants (en paires)
    const pairsToAdd = (desired_val - currentPlayersCount) / 2;
    add_player(pairsToAdd);
  }
  else if (desired_val < currentPlayersCount) {
    // Enlever les joueurs en trop
    const pairsToRemove = (currentPlayersCount - desired_val) / 2;
    remove_player(pairsToRemove);
  }

  set_player_nbr();
}

/**
 * Valide l'alias saisi pour un joueur et met à jour le tableau
 */
function validateAlias(button: HTMLButtonElement): void {
  const container = button.closest(".player-entry") as HTMLDivElement;
  const input = container.querySelector("input.alias-input") as HTMLInputElement;

  if (!input || input.value.trim() === "") return;

  const alias = input.value.trim();

  // Vérifie si alias déjà utilisé ailleurs
  const allInputs = document.querySelectorAll(".alias-input") as NodeListOf<HTMLInputElement>;
  const duplicate = Array.from(allInputs).some(otherInput =>
    otherInput !== input &&
    otherInput.value.trim().toLowerCase() === alias.toLowerCase()
  );

  const errorMsg = document.getElementById("not-logged-in-msg");
  if (!errorMsg)
    return;

  if (duplicate) {
    errorMsg.style.color = "red";
    errorMsg.textContent = "This alias is already used";
    return;
  } else {
    errorMsg.textContent = "";
  }

  const playerId = container.id;
  const player = players[playerId];
  if (player)
    player.alias = alias;
  extractPlayerAliases();
  updatePlayButton();
}

function removePlayerByName(players: string[], name: string): void {
  const index = players.indexOf(name);
  if (index !== -1) {
    players.splice(index, 1);
  }
}

let i = 0;
let end_of_tournament_iteration = false;
const winners: string[] = [];

function waitForEndGame(): Promise<void> {
  return new Promise((resolve) => {
    
    const check = () => {
      if (end_game)
        resolve();
      else
        setTimeout(check, 100);
    };

    check();

  });
}

async function play_tournament() {
  let matches = winners.length / 2;
  let currentMatchIndex = 1;
  
  while (currentMatchIndex <= matches) {
    player1Alias = winners[i];
    player2Alias = winners[++i];
    end_game = false;
    if (currentMatchIndex == matches)
      end_of_tournament_iteration = true;
    else
      end_of_tournament_iteration = false;
    await navigateTo("/pong_tournament");
    await waitForEndGame();
    currentMatchIndex++;
  }
}

async function startTournament(button: HTMLButtonElement):Promise<void> {
  const playersArray = Object.values(players).map(player => player.alias);
  winners.length = 0;
  winners.push(...playersArray);
  while (winners.length > 1) {
    await play_tournament();
    i = 0;
  }
}

function endGameFlag() {
  end_game = true;
  if (winners.length == 1)
    navigateTo("/");
}

/**
 * Active ou désactive le bouton Play selon la validation des alias
 */

// Check if all players have aliases
function allAliases(): boolean {
  return Object.values(players).every(player => player.alias.trim() !== "");
}

function updatePlayButton(): void {
  const inputs = document.querySelectorAll(".alias-input") as NodeListOf<HTMLInputElement>;
  const playButton = document.getElementById("play-button") as HTMLButtonElement;
  playButton.disabled = true; // Makes it unclickable

  if (allAliases() && inputs.length > 0) {
    playButton.disabled = false;
    playButton.classList.remove("bg-gray-400", "cursor-not-allowed");
    playButton.classList.add("bg-green-500", "cursor-pointer");
  } else {
    playButton.disabled = true;
    playButton.classList.add("bg-gray-400", "cursor-not-allowed");
    playButton.classList.remove("bg-green-500", "cursor-pointer");
  }
}
