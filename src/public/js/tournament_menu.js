"use strict";
let playerIdCounter = 1;
const players = {};
const player_nbr_val = [2, 4, 8, 16];
/**
 * Initialise les événements, le slider et les joueurs au chargement
 */
function init_tournamentMenu() {
    init_events();
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
    if (player) {
        player.alias = alias;
        console.log(`Alias mis à jour pour ${player.id}: ${player.alias}`);
    }
    updatePlayButton();
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
    if (allAliases() && inputs.length > 0) {
        playButton.disabled = false;
        playButton.classList.remove("bg-gray-400", "cursor-not-allowed");
        playButton.classList.add("bg-green-500", "cursor-pointer");
    }
    else {
        playButton.disabled = true;
        playButton.classList.add("bg-gray-400", "cursor-not-allowed");
        playButton.classList.remove("bg-green-500", "cursor-pointer");
    }
}
