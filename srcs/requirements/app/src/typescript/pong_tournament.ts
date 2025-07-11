/* ************************************************************************** */
/*                                GLOBAL VARIABLES                            */
/* ************************************************************************** */
/*
* Defnining canvas and context */
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var reset_button: HTMLButtonElement;

/*
 * Define drawing var
 */
const GOLDEN_NUMBER_T: number = 1.618033;
const PLAYER_WIDTH_RATIO_T: number = 0.009;
const PLAYER_WIDTH_HEIGHT_RATIO_T: number = 10;
var PLAYER_HEIGHT_T: number;
var PLAYER_WIDTH_T: number;
const PLAYER_COLOR_T: string = "#FFFFFF";
const PLAYER_SPEED_T: number = 5;

/* Score + Text */
const FONT_NAME_T: string = "sans-serif";
var FONT_SIZE: number;
const SCORE_POS_RATIO_T: number = 0.9;
const MSG_POS_RATIO_T: number = 0.7;

/* Ball_T */
let ball_color_T = "#FFFFFF";
const BALL_INIT_SPEED_T: number = 10;
//const BALL_COLOR_T: string = "#FFFFFF";
const BALL_MAX_SPEED_T: number = 12;
var BALL_RADIUS_T: number;
/* Terrain draw */
const TERRAIN_COLOR_T: string = "#FFFFFF";
var TERRAIN_LINE_FAT: number;

/* Game_t status variable */
const PLAYER_ONE_T: number = 1;
const PLAYER_TWO_T: number = 2;
var game_t: Pong_T;
var end_game: boolean;
var start_game: boolean;
var game_interval: NodeJS.Timeout | number;
var round_winner: number;
var p1_upPressed: boolean = false;
var p1_downPressed: boolean = false;
var p2_upPressed: boolean = false;
var p2_downPressed: boolean = false;


/*                              CLASSES && INTERFACES                         */
/* ************************************************************************** */

interface Vec2 {
	x: number;
	y: number;
}

class Player_T {
	name: string;
	score: number;
	pos: Vec2;
	speed: number;

	constructor(name: string, pos: Vec2) {
		this.name = name;
		this.score = 0;
		this.pos = pos;
		this.speed = PLAYER_SPEED_T;
	}
}

class Ball_T {
	pos: Vec2;
	direction: Vec2;
	speed: number;

	constructor(pos: Vec2) {
		this.pos = pos;
		this.direction = { x: 0.45, y: 0.55 };
		this.speed = BALL_INIT_SPEED_T;
	}
}

class Pong_T {
	player_1: Player_T;
	player_2: Player_T;
	ball_T: Ball_T;
	score_max: number;
	new_round: boolean;

	constructor(player_1_name: string, player_2_name: string, center: Vec2) {
		if (!canvas)
			throw new Error("Canvas not found.");
		const player_offset = 0.05 * canvas.width;
		this.player_1 = new Player_T(player_1_name, { x: player_offset, y: (canvas.height - PLAYER_HEIGHT_T) / 2 });
		this.player_2 = new Player_T(player_2_name, { x: canvas.width - player_offset, y: (canvas.height - PLAYER_HEIGHT_T) / 2 });
		this.ball_T = new Ball_T(center);
		this.score_max = 5;
		this.new_round = true;
	}
}

/* ************************************************************************** */
/*                                       DRAW                                 */
/* ************************************************************************** */
/**
 * @brief Draw player_T score
 */
function draw_score_t() {
	if (!ctx)
		throw new Error("Context not found");
	let score_pos: Vec2 = {
		x: SCORE_POS_RATIO_T * canvas.width / 2,
		y: (1 - SCORE_POS_RATIO_T) * canvas.height
	};
	/* Calculate score width */
	const player1ScoreWidth = ctx.measureText(`${game_t.player_1.score}`).width;
	const player2ScoreWidth = ctx.measureText(`${game_t.player_2.score}`).width;

	/* Draw score */
	ctx.font = `${FONT_SIZE}px ${FONT_NAME_T}`;
	ctx.fillText(`${game_t.player_1.score}`, score_pos.x - player1ScoreWidth / 2, score_pos.y);
	ctx.fillText(`${game_t.player_2.score}`, canvas.width - score_pos.x - player2ScoreWidth / 2, score_pos.y);
}

/**
 * @brief Draw basic pong_T terrain
 */

function draw_terrain_t() {
	if (!canvas)
		throw new Error("Canvas not found");
	if (!ctx)
		throw new Error("Context not found");

	ctx.beginPath();
	ctx.rect((canvas.width - TERRAIN_LINE_FAT) / 2, 0, TERRAIN_LINE_FAT, canvas.height);
	//ctx.rect(0, y, canvas.width, LINE_THICKNESS); // Ligne horizontale
	ctx.fillStyle = "#FFFFFF"; // Blanc
	ctx.fill();
}

const RANDOM_BOUNCE_ANGLE_T = 0.5;
/**
 * @brief Update ball_T direction and speed on collision
 */
let number_t = 1;
function update_ball_state_t() {
	let p1 = game_t.player_1;
	let p2 = game_t.player_2;
	let ball_T = game_t.ball_T;
	let dir = game_t.ball_T.direction;
	let ball_next_pos = { x: ball_T.pos.x + ball_T.speed * dir.x, y: ball_T.pos.y + ball_T.speed * dir.y };

	/* Check for wall collision */
	if (ball_next_pos.y > canvas.height - BALL_RADIUS_T || ball_next_pos.y < BALL_RADIUS_T)
		dir.y = -dir.y;

	if ((ball_T.pos.x > p1.pos.x && ball_T.pos.x < p1.pos.x + PLAYER_WIDTH_T)
		&& (ball_T.pos.y > p1.pos.y && ball_T.pos.y < p1.pos.y + PLAYER_HEIGHT_T) && number == 0) {
		number = 1;
		dir.x = -dir.x;
		dir.y += 0.08;
		game_t.ball_T.speed = Math.min(BALL_MAX_SPEED_T, ball_T.speed + 1);
	}
	if ((ball_T.pos.x > p2.pos.x && ball_T.pos.x < p2.pos.x + PLAYER_WIDTH_T)
		&& (ball_T.pos.y > p2.pos.y && ball_T.pos.y < p2.pos.y + PLAYER_HEIGHT_T) && number == 1) {
		number = 0;
		dir.x = -dir.x;
		dir.y += -0.08;
		ball_T.speed = Math.min(BALL_MAX_SPEED_T, ball_T.speed + 1);
	}

	/* Check if player1 win a point */
	if (ball_next_pos.x > canvas.width - BALL_RADIUS_T) {
		p1.score += 1;
		game_t.new_round = true;
	}

	/* Check if player2 win a point */
	if (ball_next_pos.x < BALL_RADIUS_T) {
		p2.score += 1;
		game_t.new_round = true;
	}

	/* Update ball_T position */
	game_t.ball_T.pos = {
		x: ball_T.pos.x + dir.x * ball_T.speed,
		y: ball_T.pos.y + dir.y * ball_T.speed
	};
}

/**
 * @brief Move player_T
 */

function update_player_pos_t() {
	let p1 = game_t.player_1;
	let p2 = game_t.player_2;

	if (!canvas)
		throw new Error("Canvas not found");
	/* Update position */

	if (p1_upPressed && !p1_downPressed)
		p1.pos.y -= p1.speed;
	if (!p1_upPressed && p1_downPressed)
		p1.pos.y += p1.speed;
	if (p2_upPressed && !p2_downPressed)
		p2.pos.y -= p2.speed;
	if (!p2_upPressed && p2_downPressed)
		p2.pos.y += p2.speed;

	let player_offset = 0.05 * canvas.width;

	p1.pos.x = player_offset;
	p2.pos.x = canvas.width - player_offset;

	/* Check for out of bound */
	if (p1.pos.y > canvas.height - PLAYER_HEIGHT_T)
		p1.pos.y = canvas.height - PLAYER_HEIGHT_T;
	if (p1.pos.y < 0)
		p1.pos.y = 0;

	/* Check for out of bound */
	if (p2.pos.y > canvas.height - PLAYER_HEIGHT_T)
		p2.pos.y = canvas.height - PLAYER_HEIGHT_T;
	if (p2.pos.y < 0)
		p2.pos.y = 0;
}

/**
 * @brief Draw the two players
 */
function draw_player_t(player_T: Player_T) {
	if (!canvas)
		throw new Error("Canvas not found");
	if (!ctx)
		throw new Error("Context not found");

	// ctx.beginPath();
	ctx.rect(player_T.pos.x, player_T.pos.y, PLAYER_WIDTH_T, PLAYER_HEIGHT_T);
	ctx.fillStyle = PLAYER_COLOR_T;
	ctx.fill();
}

/**
 * @brief Draw ball  on screen
 */
function draw_ball_t(ball_T: Ball_T) {
	if (!ctx)
		throw new Error("Context not found.");
	ctx.beginPath();
	ctx.arc(ball_T.pos.x, ball_T.pos.y, BALL_RADIUS_T, 0, 2 * Math.PI);
	ctx.fillStyle = ball_color_T;
	ctx.fill();
}

/**
 * @brief Draw the pong_T game_t frame
 */
function draw_t() {
	if (!canvas)
		throw new Error("Canvas context not found");
	if (!ctx)
		throw new Error("Context not found");
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	draw_terrain_t();
	draw_player_t(game_t.player_1);
	draw_player_t(game_t.player_2);
	draw_ball_t(game_t.ball_T);
	draw_score_t();
	ctx.closePath();
	update_player_pos_t();
	update_ball_state_t();
}

/**
 * @brief Draw final state, when player_T win
 */
function draw_finish_t() {
	if (!canvas)
		throw new Error("Canvas context not found");
	if (!ctx)
		throw new Error("Context not found");
	let msg_pos: Vec2 = {
		x: MSG_POS_RATIO_T * canvas.width / 2,
		y: (1 - MSG_POS_RATIO_T) * canvas.height
	};
	const msg_len: number = ctx.measureText("YOU WIN").width;
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	reset_ball_t();
	reset_player_pos_t();
	draw_terrain_t();
	draw_player_t(game_t.player_1);
	draw_player_t(game_t.player_2);
	draw_ball_t(game_t.ball_T);
	draw_score_t();
	resizeCanvas_t();
	ctx.font = `${FONT_SIZE}px ${FONT_NAME_T}`;
	if (game_t.player_1.score >= game_t.score_max)
		ctx.fillText("YOU WIN", msg_pos.x - msg_len, msg_pos.y);
	else
		ctx.fillText("YOU WIN", canvas.width - msg_pos.x, msg_pos.y);
	game_t.player_1.score = 0;
	game_t.player_2.score = 0;
	ctx.closePath();
}

/* ************************************************************************** */
/*                                  KEY HANDLER                               */
/* ************************************************************************** */
/**
 * @brief Pressed key handler
 *
 * Check if one player_T want to move
 */
function pressedKeyHandler_t(e: KeyboardEvent) {
	if (e.key === "Up" || e.key === "ArrowUp")
		p2_upPressed = true;
	if (e.key === "Down" || e.key === "ArrowDown")
		p2_downPressed = true;
	if (e.key === "w" || e.key === "W") // || e.key === "z" || e.key === "Z") // AZERTY keyboard
		p1_upPressed = true;
	if (e.key === "s" || e.key === "S")
		p1_downPressed = true;
}

/**
 * @brief Released key handler
 *
 * Check if one player_T want to stop move
 */
function releasedKeyHandler_t(e: KeyboardEvent) {
	if (e.key === "Up" || e.key === "ArrowUp")
		p2_upPressed = false;
	if (e.key === "Down" || e.key === "ArrowDown")
		p2_downPressed = false;
	if (e.key === "w" || e.key === "W") // || e.key === "z" || e.key === "Z") // AZERTY keyboard
		p1_upPressed = false;
	if (e.key === "s" || e.key === "S")
		p1_downPressed = false;
}

/* ************************************************************************** */
/*                                      GAME_t                                  */
/* ************************************************************************** */
/**
 * @brief Reset ball_T position
 *
 * On new game_t or new round
 */
let ball_start_flag_t = 1;

function reset_ball_t() {
	game_t.ball_T.pos = { x: canvas.width / 2, y: canvas.height / 2 };
	game_t.ball_T.direction = { x: 0.45, y: 0.55 };
	game_t.ball_T.speed = 0;
	number = 1;
	ball_start_flag *= -1;
}

/**
 * @brief Set player_T position to the middle
 */
function reset_player_pos_t() {
	const player_offset = 0.05 * canvas.width;
	game_t.player_1.pos = { x: player_offset, y: (canvas.height - PLAYER_HEIGHT_T) / 2 };
	game_t.player_2.pos = { x: canvas.width - player_offset, y: (canvas.height - PLAYER_HEIGHT_T) / 2 };
}

/**
 * @brief start a new round
 *
 * Laucnh the ball_T
 */
function start_round_t() {
	game_t.ball_T.speed = BALL_INIT_SPEED_T;
	if (round_winner === PLAYER_ONE_T)
		game_t.ball_T.direction = { x: -0.45, y: 0.55 };
	else
		game_t.ball_T.direction = { x: 0.45, y: 0.55 };
}

async function update_user_stats_t(alias1: string, alias2: string, p1_score: number, p2_score: number, trnmnt_winner: boolean): Promise<void> {
	try {

		const response = await fetch('/updateUserStats', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ alias1, alias2, p1_score, p2_score, trnmnt_winner: trnmnt_winner}) // Send the scores to the backend
		});

		if (!response.ok) {
			console.log('User not in the DB');
		}
	} catch (error) {
		console.error('Error updating user stats:', error);
	}
}

/** 
 * @brief Handler on game_t finish and draw results at the screen
 */
function finish_game_t() {
	const resultMessage = document.getElementById("game-result-message");
	const resultTitle = document.getElementById("result-title");
	const resultScore = document.getElementById("result-score");
	const next_players = document.getElementById("next_players");
	const button = document.getElementById("next-match-button");
	let winner;
	let j;

	if (end_of_tournament_iteration || winners.length == 2)
		j = 0;
	else
		j = i;
	if (resultMessage && resultTitle && resultScore) {
		resultMessage.classList.remove("hidden");

		const p1Score = game_t.player_1.score;
		const p2Score = game_t.player_2.score;
		if (p1Score > p2Score)
			winner = game_t.player_1.name;
		else
			winner = game_t.player_2.name;

		resultTitle.textContent = winner + " WON !";
		resultScore.textContent = `${p1Score} - ${p2Score}`;
		if (winners[j] && winners[j + 1] && winners.length > 4) {
			next_players!.textContent = "Next match: " + winners[j] + " VS " + winners[j + 1];
			button!.textContent = "Ready ?";
		}
		else if (winners[j] && winners[j + 1] && (winners.length == 4 || winners.length == 3)) {
			next_players!.textContent = "Next, Semifinal: " + winners[j] + " VS " + winners[j + 1];
			button!.textContent = "Ready ?";
		}
		else if (winners[j] && winners[j + 1] && winners.length == 2) {
			next_players!.textContent = "Next, Final: " + winners[j] + " VS " + winners[j + 1];
			button!.textContent = "Ready ?";
		}
		else {
			if (localGame == false)
				next_players!.textContent = "Congratulations " + winners[0] + ", you won the tournament !";
			else
				next_players!.textContent = "Congratulations " + winners[0] + ", you won!";
			button!.textContent = "Back to home";
			disableScroll = false;
		}
		button?.addEventListener("click", endGameFlag);
		button?.removeEventListener("click", startGameFlag);
	}
	draw_finish_t();
}

function removeWinner() {
	if (game_t.player_1.score < game_t.player_2.score) {
		const index = winners.indexOf(game_t.player_1.name);
		if (index !== -1) {
			winners.splice(index, 1);
		}
	}
	else {
		const index = winners.indexOf(game_t.player_2.name);
		if (index !== -1) {
			winners.splice(index, 1);
		}
	}
}

function show_next_match() {
	const resultMessage = document.getElementById("game-result-message");
	const resultTitle = document.getElementById("result-title");
	const next_players = document.getElementById("next_players");
	const button = document.getElementById("next-match-button");
	let winner;
	let j;

	if (end_of_tournament_iteration)
		j = 0; // VERY RISKY
	else
		j = i;
	if (resultMessage && resultTitle) {
		resultMessage.classList.remove("hidden");
		resultTitle.textContent = "Match !";
		next_players!.textContent = "Next match: " + winners[j] + " VS " + winners[j + 1]; // VERY RISKY
		button!.textContent = "Go !";
		button?.removeEventListener("click", endGameFlag);
		button?.addEventListener("click", startGameFlag);
	}
}

/**
 * @brief Main game_t loop
 */
function game_loop_t() {
  var trnmnt_winner:boolean = false;
	if (game_t.player_1.score >= game_t.score_max || game_t.player_2.score >= game_t.score_max) {
		i++;
		removeWinner();

    if (winners.length == 1)
      trnmnt_winner = true;

    if (localGame)
      trnmnt_winner = false;

		update_user_stats_t(player1Alias, player2Alias, game_t.player_1.score, game_t.player_2.score, trnmnt_winner);
		update_user_stats_t(player2Alias, player1Alias, game_t.player_2.score, game_t.player_1.score, trnmnt_winner);
		finish_game_t();
		clearInterval(game_interval);
		return;
	}
	if (game_t.new_round) {
		reset_ball_t();
		setTimeout(start_round_t, 1000);
		game_t.new_round = false;
	}
	draw_t();
}

/**
 * @brief Launch a new pong_T game_t
 */
function launch_game_t(p1_name: string, p2_name: string) {
	if (!canvas)
		throw new Error("Canvas not found");
	if (!p1_name || !p2_name)
		throw new Error("Invalid player_T name");
	resizeCanvas_t();
	game_t = new Pong_T(p1_name, p2_name, { x: canvas.width / 2, y: canvas.height / 2 });
	game_t.ball_T.direction = { x: 0.5, y: 0.5 };
}

/* ************************************************************************* */
/*                                    SPECIAL                                 */
/* ************************************************************************** */

/**
 * @brief REsize canvas for "Responsivness"
 */
function resizeCanvas_t() {
	if (!ctx)
		throw new Error("Context not found");
	if (!canvas)
		throw new Error("Canvas not found");

	// Fixe une taille constante au canvas
	canvas.width = screen.width * 0.73;
	canvas.height = screen.height * 0.73;

	PLAYER_WIDTH_T = canvas.width * PLAYER_WIDTH_RATIO_T;
	PLAYER_HEIGHT_T = PLAYER_WIDTH_T * PLAYER_WIDTH_HEIGHT_RATIO_T;
	TERRAIN_LINE_FAT = 0.01 * Math.max(canvas.width, canvas.height);
	BALL_RADIUS_T = 0.01 * Math.min(canvas.width, canvas.height);
	FONT_SIZE = 0.08 * Math.min(canvas.width, canvas.height);
}

/**
 * @brief Load the different event for the pong_T game_t
 *
 * This function should be called when the rigth html page is loaded
 */
async function load_script_t() {
	try {
		//const data = await getUserName_t();
		disableScroll = true;
		const leftName = document.getElementById("left-player-name");
		if (leftName)
			leftName.innerHTML = player1Alias;
		const rightName = document.getElementById("right-player-name");
		if (rightName)
			rightName.innerHTML = player2Alias;
		canvas = document.getElementById("pong_canvas") as HTMLCanvasElement;
		if (!canvas)
			throw new Error("Canvas not found");
		ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if (!ctx)
			throw new Error("Context not found");

		/* Start game_t */
		if (game_interval)
			clearInterval(game_interval);
		start_game = false;
		show_next_match();
		await waitForStartGame();
		game_interval = setInterval(game_loop_t, 8);
		launch_game_t(player1Alias, player2Alias);
		/* Set events listeners */
		document.addEventListener("keydown", pressedKeyHandler, false);
		document.addEventListener("keyup", releasedKeyHandler, false);
	}
	catch (err: any) {
		console.log(err);
	}
}
