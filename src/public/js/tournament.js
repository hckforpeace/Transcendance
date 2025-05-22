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

// document.addEventListener("DOMContentLoaded", function() {
// 	set_player_nbr();
// });

// slider.addEventListener("input", function() {
// 	set_player_nbr();
// });
