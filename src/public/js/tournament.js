/**
 * Define tournament menu javascript functions for buttonsm inputsm slider...
 *
 */

/* ************************************************************************** */
/*                                      INIT                                  */
/* ************************************************************************** */

/**
 * Add all the necessary events listeners
 */
function init_events() {
	const	player_slider = document.getElementById("player_nbr_slider");

	player_slider.addEventListener("input", update_player);
}

/**
 * Init the frontend js part on page load
 */
function init() {
	init_events();
	set_player_nbr();
	update_player();
}

/* ************************************************************************** */
/*                           SLIDER (Player nbr select)                       */
/* ************************************************************************** */

/* Define global variable */
const	player_nbr_val = [2, 4, 8, 16];


/**
 * Get previous player selector object
 *
 * When user click on left arrow to change player type
 *
 * @paran event -- event object
 */
function get_next_player_type(event) {
	const	clickedButton = event.target;
	const	buttonDiv = clickedButton.parentNode;
	const	childP = buttonDiv.querySelector("p");

	if (childP.innerText === "Bot")
		childP.innerText = "Guest";
	else if (childP.innerText === "Guest")
		childP.innerText = "User";
	else
		childP.innerText = "Bot";
}

/**
 * Get next player selector object
 *
 * When user click on right arrow to change player type
 *
 * @paran event -- event object
 */
function get_prev_player_type(event) {
	const	clickedButton = event.target;
	const	buttonDiv = clickedButton.parentNode;
	const	childP = buttonDiv.querySelector("p");

	if (childP.innerText === "Guest")
		childP.innerText = "Bot";
	else if (childP.innerText === "User")
		childP.innerText = "Guest";
	else
		childP.innerText = "User";
}

/* ************************************************************************** */
/*                                SLIDER FUNCTOINS                            */
/* ************************************************************************** */
var	slider_val = 2;

/**
 * Count the number of player element
 */
function count_player() {
	const	player_nbr = document.querySelectorAll(".player");

	return player_nbr.length;
}

/**
 * Update the player rows based on the slider value
 */
function update_player() {
	const	player_nbr = count_player();
	const	slider_val = player_nbr_val[document.getElementById("player_nbr_slider").value];
	
	if (slider_val > player_nbr)
		add_player((slider_val - player_nbr) / 2);
	else
		remove_player((player_nbr - slider_val) / 2);
}
/**
* Set the value of the slider text field
*/
function set_player_nbr() {
	var	slider = document.getElementById("player_nbr_slider");
	var	text_field = document.getElementById("player_nbr");
	text_field.textContent = player_nbr_val[slider.value];
};

/**
 * Use the player template to add one player in both player contaiers
 */
function add_one_player() {

	const playerTemplate = document.getElementById("t-player-elem");
	const playerContainer1 = document.getElementById("player-container1");
	const playerContainer2 = document.getElementById("player-container2");
	const player1 = playerTemplate.content.cloneNode(true);
	const player2 = playerTemplate.content.cloneNode(true);

	// Clone the template content for Player 1
	playerContainer1.appendChild(player1);

	// Clone the template content for Player 1
	playerContainer2.appendChild(player2);
}

/**
 * Add a specified number of players to both player containers
 *
 * @param nbr - The number of players to add
 */
function add_player(nbr) {
	for (i = 0; i < nbr; i++)
		add_one_player();
}

/**
 * Remove one player from both player containers
 */
function remove_one_player() {
	const playerContainer1 = document.getElementById("player-container1");
	const playerContainer2 = document.getElementById("player-container2");

	// Remove the last child from both containers if they have children
	playerContainer1.removeChild(playerContainer1.children[playerContainer1.children.length - 1]);
	playerContainer2.removeChild(playerContainer2.children[playerContainer2.children.length - 2]);
}

/**
 * Remove a specified number of players to both player containers
 *
 * @param nbr - The number of players to remove
 */
function remove_player(nbr) {
	for (i = 0; i < nbr; i++)
		remove_one_player();
}
