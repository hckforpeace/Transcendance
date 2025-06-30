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
let playerIdCounter = 1;
let player1Alias = '';
let player2Alias = '';
let players = {};
const player_nbr_val = [2, 4, 8, 16];
function extractPlayerAliases() {
    const input1 = document.querySelector('#player-container1 .alias-input');
    const input2 = document.querySelector('#player-container2 .alias-input');
    player1Alias = (input1 === null || input1 === void 0 ? void 0 : input1.value.trim()) || '';
    player2Alias = (input2 === null || input2 === void 0 ? void 0 : input2.value.trim()) || '';
}
// LOCAL PLAY
function init_localPong() {
    player1Alias = '';
    player2Alias = '';
    players = {};
    end_of_tournament_iteration = false;
    end_game = true;
    updatePlayButton();
    add_two_players();
}
function playLocalPong() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        player1Alias = ((_a = players['player_1']) === null || _a === void 0 ? void 0 : _a.alias) || '';
        player2Alias = ((_b = players['player_2']) === null || _b === void 0 ? void 0 : _b.alias) || '';
        end_game = false;
        yield navigateTo("/pong_tournament");
        yield waitForEndGame();
    });
}
/**
 * Initialise les événements, le slider et les joueurs au chargement
 */
function init_tournamentMenu() {
    winners.length = 0;
    // winners = [];
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
    const player_slider = document.getElementById("player_nbr_slider");
    if (!player_slider)
        return;
    player_slider.addEventListener("input", update_player);
}
/**
 * Vide les conteneurs et réinitialise le compteur et tableau joueurs
 */
function resetPlayers() {
    const container1 = document.getElementById("player-container1");
    const container2 = document.getElementById("player-container2");
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
    const slider = document.getElementById("player_nbr_slider");
    const text_field = document.getElementById("player_nbr");
    if (!slider || !text_field)
        return;
    text_field.textContent = player_nbr_val[Number(slider.value)].toString();
}
/**
 * Ajoute une paire de joueurs (gauche + droite) avec IDs croissants
 */
function add_two_players() {
    const playerTemplate = document.getElementById("t-player-elem");
    const playerContainer1 = document.getElementById("player-container1");
    const playerContainer2 = document.getElementById("player-container2");
    if (!playerTemplate || !playerContainer1 || !playerContainer2)
        return;
    // Joueur gauche
    const playerLeft = playerTemplate.content.cloneNode(true);
    const playerLeftDiv = playerLeft.querySelector(".player-entry");
    const idLeft = `player_${playerIdCounter++}`;
    playerLeftDiv.id = idLeft;
    playerContainer1.appendChild(playerLeft);
    players[idLeft] = { id: idLeft, alias: "" };
    // Joueur droite
    const playerRight = playerTemplate.content.cloneNode(true);
    const playerRightDiv = playerRight.querySelector(".player-entry");
    const idRight = `player_${playerIdCounter++}`;
    playerRightDiv.id = idRight;
    playerContainer2.appendChild(playerRight);
    players[idRight] = { id: idRight, alias: "" };
}
/**
 * Ajoute n paires de joueurs
 */
function add_player(nbr) {
    for (let i = 0; i < nbr; i++) {
        add_two_players();
    }
}
/**
 * Supprime n paires de joueurs du DOM et du tableau players
 */
function remove_player(nbr) {
    var _a, _b;
    const playerContainer1 = document.getElementById("player-container1");
    const playerContainer2 = document.getElementById("player-container2");
    for (let i = 0; i < nbr; i++) {
        // Supprime dernier joueur à gauche
        const lastLeft = playerContainer1.lastElementChild;
        if (lastLeft) {
            const idLeft = (_a = lastLeft.querySelector(".player-entry")) === null || _a === void 0 ? void 0 : _a.id;
            if (idLeft && players[idLeft]) {
                delete players[idLeft];
            }
            playerContainer1.removeChild(lastLeft);
        }
        // Supprime dernier joueur à droite
        const lastRight = playerContainer2.lastElementChild;
        if (lastRight) {
            const idRight = (_b = lastRight.querySelector(".player-entry")) === null || _b === void 0 ? void 0 : _b.id;
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
    const slider = document.getElementById("player_nbr_slider");
    if (!slider)
        return;
    const desired_val = player_nbr_val[Number(slider.value)];
    const half = desired_val / 2;
    const container1 = document.getElementById("player-container1");
    const container2 = document.getElementById("player-container2");
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
function validateAlias(button) {
    const container = button.closest(".player-entry");
    const input = container.querySelector("input.alias-input");
    if (!input || input.value.trim() === "")
        return;
    const alias = input.value.trim();
    // Vérifie si alias déjà utilisé ailleurs
    const allInputs = document.querySelectorAll(".alias-input");
    const duplicate = Array.from(allInputs).some(otherInput => otherInput !== input &&
        otherInput.value.trim().toLowerCase() === alias.toLowerCase());
    const errorMsg = document.getElementById("not-logged-in-msg");
    if (!errorMsg)
        return;
    if (duplicate) {
        errorMsg.style.color = "red";
        errorMsg.textContent = "This alias is already used";
        return;
    }
    else {
        errorMsg.textContent = "";
    }
    const playerId = container.id;
    const player = players[playerId];
    if (player)
        player.alias = alias;
    button.classList.remove("bg-gray-400", "hover:bg-gray-600");
    button.classList.add("bg-blue-500", "hover:bg-blue-600");
    extractPlayerAliases();
    updatePlayButton();
}
function removePlayerByName(players, name) {
    const index = players.indexOf(name);
    if (index !== -1) {
        players.splice(index, 1);
    }
}
let i = 0;
let end_of_tournament_iteration = false;
var winners = [];
function waitForEndGame() {
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
function play_tournament() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield navigateTo("/pong_tournament");
            yield waitForEndGame();
            currentMatchIndex++;
        }
    });
}
function startTournament(button) {
    return __awaiter(this, void 0, void 0, function* () {
        const playersArray = Object.values(players).map(player => player.alias);
        winners.length = 0;
        winners.push(...playersArray);
        while (winners.length > 1) {
            yield play_tournament();
            i = 0;
        }
    });
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
function allAliases() {
    return Object.values(players).every(player => player.alias.trim() !== "");
}
function updatePlayButton() {
    const inputs = document.querySelectorAll(".alias-input");
    const playButton = document.getElementById("play-button");
    playButton.disabled = true; // Makes it unclickable
    if (allAliases() && inputs.length > 0) {
        playButton.disabled = false;
        playButton.classList.remove("bg-gray-400", "hover:bg-gray-600", "cursor-not-allowed");
        playButton.classList.add("bg-green-500", "hover:bg-green-600", "cursor-pointer");
    }
    else {
        playButton.disabled = true;
        playButton.classList.add("bg-gray-400", "hover:bg-gray-600", "cursor-not-allowed");
        playButton.classList.remove("bg-green-500", "hover:bg-blue-600", "cursor-pointer");
    }
}
