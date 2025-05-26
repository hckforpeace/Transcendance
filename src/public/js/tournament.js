/**
 * Define tournament menu javascript functions for buttonsm inputsm slider...
 *
 */

/* ************************************************************************** */
/*                           SLIDER (Player nbr select)                       */
/* ************************************************************************** */
/* Define global variable */
const	player_nbr_val = [2, 4, 8, 16];


/**
* Set the value of the slider to the text field
*/
function set_player_nbr() {
	var	slider = document.getElementById("player_nbr_slider");
	var	text_field = document.getElementById("player_nbr");
	text_field.textContent = player_nbr_val[slider.value];
};

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
