const TRAINING: boolean = true;

// good q_table [[-70.28332858639581,-67.39572839787385,-67.9925017203187],[-169.1303716177985,-170.35391922866512,-168.04508258288976],[-82.30781956258527,-104.16800033585639,-83.28559188861938]]
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
const GOLDEN_NUMBER: number = 1.618033;
const PLAYER_WIDTH_RATIO: number = 0.009;
const PLAYER_WIDTH_HEIGHT_RATIO: number = 10;
var PLAYER_HEIGHT: number;
var PLAYER_WIDTH: number;
const PLAYER_COLOR: string = "#FFFFFF";
const PLAYER_SPEED: number = 10;

/* Score + Text */
const FONT_NAME: string = "sans-serif";
var FONT_SIZE: number;
const SCORE_POS_RATIO: number = 0.9;
const MSG_POS_RATIO: number = 0.7;

/* Ball */
let ball_color = "#FFFFFF";
const BALL_INIT_SPEED: number = 10;
//const BALL_COLOR: string = "#FFFFFF";
const BALL_MAX_SPEED: number = 12;
var BALL_RADIUS: number;
/* Terrain draw */
const TERRAIN_COLOR: string = "#FFFFFF";
var TERRAIN_LINE_FAT: number;

/* Game status variable */
const PLAYER_ONE: number = 1;
const PLAYER_TWO: number = 2;
var game: Pong;
var end_game: boolean;
var game_interval: NodeJS.Timeout | number;
var round_winner: number;
var p1_upPressed: boolean = false;
var p1_downPressed: boolean = false;
var p2_upPressed: boolean = false;
var p2_downPressed: boolean = false;

/* IA Q_algorythm value */
let rewards: number = 0;
var NUM_ACTIONS: number = 3;
var NUM_STATES: number = 3;
const ALPHA: number = 0.2;
const GAMMA: number = 0.7;
let EPSILON: number = 1;
let EPSILON_MIN: number = 0.2;
const epsilon_decay_rate: number = 0.000001;
let Q_table: number[][] = [[-70.28332858639581,-67.39572839787385,-67.9925017203187],[-169.1303716177985,-170.35391922866512,-168.04508258288976],[-82.30781956258527,-104.16800033585639,-83.28559188861938]];
let Q_table_training: number[][] = Array.from({ length: NUM_STATES }, () => new Array(NUM_ACTIONS).fill(0));
/*                              CLASSES && INTERFACES                         */
/* ************************************************************************** */

interface Vec2 {
	x: number;
	y: number;
}

class Player {
	name: string;
	score: number;
	pos: Vec2;

	constructor(name: string, pos: Vec2) {
		this.name = name;
		this.score = 0;
		this.pos = pos;
	}
}

class Ball {
	pos: Vec2;
	direction: Vec2;
	speed: number;

	constructor(pos: Vec2) {
		this.pos = pos;
		this.direction = { x: 0.45, y: 0.55 };
		this.speed = BALL_INIT_SPEED;
	}
}

class Pong {
	player_1: Player;
	player_2: Player;
	ball: Ball;
	score_max: number;
	new_round: boolean;

	constructor(player_1_name: string, player_2_name: string, center: Vec2) {
		if (!canvas)
			throw new Error("Canvas not found.");
		const player_offset = 0.05 * canvas.width;
		this.player_1 = new Player(player_1_name, { x: player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 });
		this.player_2 = new Player(player_2_name, { x: canvas.width - player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 });
		this.ball = new Ball(center);
		if (TRAINING)
			this.score_max = 3;
		else
			this.score_max = 10;
		this.new_round = true;
	}
}

/* ************************************************************************** */
/*                                       DRAW                                 */
/* ************************************************************************** */
/**
 * @brief Draw player score
 */
function draw_score() {
	if (!ctx)
		throw new Error("Context not found");
	let score_pos: Vec2 = {
		x: SCORE_POS_RATIO * canvas.width / 2,
		y: (1 - SCORE_POS_RATIO) * canvas.height
	};
	/* Calculate score width */
	const player1ScoreWidth = ctx.measureText(`${game.player_1.score}`).width;
	const player2ScoreWidth = ctx.measureText(`${game.player_2.score}`).width;

	/* Draw score */
	ctx.font = `${FONT_SIZE}px ${FONT_NAME}`;
	ctx.fillText(`${game.player_1.score}`, score_pos.x - player1ScoreWidth / 2, score_pos.y);
	ctx.fillText(`${game.player_2.score}`, canvas.width - score_pos.x - player2ScoreWidth / 2, score_pos.y);
}

/**
 * @brief Draw basic pong terrain
 */

function draw_terrain() {
	if (!canvas)
		throw new Error("Canvas not found");
	if (!ctx)
		throw new Error("Context not found");

	// Épaisseur de la ligne horizontale
	const LINE_THICKNESS = 4;

	// Position verticale (milieu de l'écran)
	const y = (canvas.height - LINE_THICKNESS) / 2;

	ctx.beginPath();
	ctx.rect((canvas.width - TERRAIN_LINE_FAT) / 2, 0, TERRAIN_LINE_FAT, canvas.height);
	ctx.rect(0, y, canvas.width, LINE_THICKNESS); // Ligne horizontale
	ctx.fillStyle = "#FFFFFF"; // Blanc
	ctx.fill();
}

const RANDOM_BOUNCE_ANGLE = 0.5;
/**
 * @brief Update ball direction and speed on collision
 */
let number = 1;
function update_ball_state() {
	let p1 = game.player_1;
	let p2 = game.player_2;
	let ball = game.ball;
	let dir = game.ball.direction;
	let ball_next_pos = { x: ball.pos.x + ball.speed * dir.x, y: ball.pos.y + ball.speed * dir.y };

	// console.log("BALL SPEED -> ", ball.speed, "FLAG -> ", number);

	/* Check for wall collision */
	if (ball_next_pos.y > canvas.height - BALL_RADIUS || ball_next_pos.y < BALL_RADIUS)
		dir.y = -dir.y;

	if ((ball.pos.x > p1.pos.x && ball.pos.x < p1.pos.x + PLAYER_WIDTH)
		&& (ball.pos.y > p1.pos.y && ball.pos.y < p1.pos.y + PLAYER_HEIGHT) && number == 0) {
		number = 1;
		dir.x = -dir.x;
		dir.y += 0.45;
		console.log("DIR Y P1 -> ", dir.y);
		game.ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
	}
	if ((ball.pos.x > p2.pos.x && ball.pos.x < p2.pos.x + PLAYER_WIDTH)
		&& (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_HEIGHT) && number == 1) {
		number = 0;
		dir.x = -dir.x;
		dir.y += -0.55;
		console.log("DIR Y P2 -> ", dir.y);
		ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
	}

	/* Check if player1 win a point */
	if (ball_next_pos.x > canvas.width - BALL_RADIUS) {
		p1.score += 1;
		game.new_round = true;
	}

	/* Check if player2 win a point */
	if (ball_next_pos.x < BALL_RADIUS) {
		p2.score += 1;
		game.new_round = true;
	}

	/* Update ball position */
	game.ball.pos = {
		x: ball.pos.x + dir.x * ball.speed,
		y: ball.pos.y + dir.y * ball.speed
	};

}

/**
 * @brief Move player
 */

/* IA Q_LEARNING MOVES */
let future_pos_y = 0;
function getFutureY(): number {
	const ball = game.ball;
	const pos = { x: ball.pos.x, y: ball.pos.y };
	const dir = { x: ball.direction.x, y: ball.direction.y };
	const speed = ball.speed;
	const playerX = game.player_2.pos.x;
	const height = canvas.height;

	// Si la balle va vers la gauche, on prédit rien
	if (dir.x <= 0 || ball.speed == 0)
		return (game.player_2.pos.y);

	let x = pos.x;
	let y = pos.y;
	let dx = dir.x * speed;
	let dy = dir.y * speed;

	while (x < playerX) {
		// temps pour atteindre le prochain bord haut ou bas
		let timeToWall = dy > 0 ? (height - BALL_RADIUS - y) / dy : (BALL_RADIUS - y) / dy;

		let timeToPaddle = (playerX - x) / dx;

		// Si la balle touche le paddle avant un mur
		if (timeToPaddle < timeToWall)
		{
			y += dy * timeToPaddle;
			break;
		}
		else
		{
			// rebond contre mur
			x += dx * timeToWall;
			y += dy * timeToWall;
			dy = -dy; // inversion de la direction verticale
		}
	}
	return (y - PLAYER_HEIGHT / 2);
}

function getState(): number {
	let ball = game.ball;
	let p2 = game.player_2;

	if (p2.pos.y < future_pos_y)
		return (1);
	if (p2.pos.y > future_pos_y + PLAYER_HEIGHT)
		return (2);
	return (0);
}

/* choose an action according to the epsilon value : this is called the epsilon-greedy */
function chooseAction(state: number): number {
	let best_action = 0;
	if (TRAINING) {
		EPSILON = Math.max(EPSILON_MIN, EPSILON * (1 - epsilon_decay_rate));
		console.log("EPSILON -> ", EPSILON);
		if (Math.random() < EPSILON)
			best_action = Math.floor(Math.random() * NUM_ACTIONS);
		else if (Q_table_training[state]) {
			best_action = Q_table_training[state].indexOf(Math.max(...Q_table_training[state]));
		}
	}
	else {
		best_action = Q_table[state].indexOf(Math.max(...Q_table[state]));
	}
	//console.log("state => ", state, "best_action => ", best_action);
	return (best_action);
}

/* Use the formula of the algorithm */
function updateTable(state: number, action: number, reward: number, next_state: number) {

	const td_target = reward + GAMMA * Math.max(...Q_table_training[next_state]);

	const td_error = td_target - Q_table_training[state][action];
	Q_table_training[state][action] += ALPHA * td_error;
}

function get_reward(): number {
	const max_reward = PLAYER_HEIGHT / 2;
	const min_reward = -max_reward;
	const y_distance = Math.abs(game.player_2.pos.y + (PLAYER_HEIGHT / 2) - future_pos_y);
	let reward = -(y_distance / canvas.height) * max_reward;

	if (y_distance < PLAYER_HEIGHT / 2)
		reward += max_reward;

	return Math.max(min_reward, reward);
}

let lastTimeIA = Date.now(); // Variable globale pour stocker le temps du dernier rafraîchissement de l'IA
let lastTime = Date.now(); // Variable globale pour stocker le temps du dernier rafraîchissement de l'IA
let currTimeIA = 0;
let currTime = 0;

let up = false;
let down = false;

let state = 0;
function update_ia_pos() {
	currTimeIA = Date.now();
	let p2 = game.player_2;
	let ball = game.ball;
	let action = 0;

	currTimeIA = Date.now();

	if (currTimeIA - lastTimeIA > 1000) {
		future_pos_y = getFutureY();
		lastTimeIA = currTimeIA;
	}

	// p2.pos.y = getFutureY();
	console.log("future_pos_y => ", future_pos_y);

	state = getState();
	action = chooseAction(state); // Action choisie par l'IA
	console.log("State = ", state, "Action = ", action);

	if (action == 1)
		p2.pos.y -= PLAYER_SPEED;
	if (action == 2)
		p2.pos.y += PLAYER_SPEED;


	// Limit of the screen for the player
	if (p2.pos.y < 0)
		p2.pos.y = 0;
	if (p2.pos.y > canvas.height - PLAYER_HEIGHT)
		p2.pos.y = canvas.height - PLAYER_HEIGHT;

	if (TRAINING) {
		let instant_reward = get_reward();
		let next_state = getState();
		updateTable(state, action, instant_reward, next_state);
	}
	// console.log("Q_table : ", Q_table);
}


function update_player_pos() {
	let p1 = game.player_1;
	let p2 = game.player_2;

	if (!canvas)
		throw new Error("Canvas not found");
	/* Update position */
	if (TRAINING)
		p1.pos.y = game.ball.pos.y - (PLAYER_HEIGHT / 2);
	else {
		if (p1_upPressed && !p1_downPressed)
			p1.pos.y -= PLAYER_SPEED;
		if (!p1_upPressed && p1_downPressed)
			p1.pos.y += PLAYER_SPEED;
	}

	if (p2_upPressed && !p2_downPressed)
		p2.pos.y -= PLAYER_SPEED;
	if (!p2_upPressed && p2_downPressed)
		p2.pos.y += PLAYER_SPEED;


	let player_offset = 0.05 * canvas.width;

	p1.pos.x = player_offset;
	p2.pos.x = canvas.width - player_offset;

	/* Check for out of bound */
	if (p1.pos.y > canvas.height - PLAYER_HEIGHT)
		p1.pos.y = canvas.height - PLAYER_HEIGHT;
	if (p1.pos.y < 0)
		p1.pos.y = 0;
}

/**
 * @brief Draw the two players
 */
function draw_player(player: Player) {
	if (!canvas)
		throw new Error("Canvas not found");
	if (!ctx)
		throw new Error("Context not found");

	// ctx.beginPath();
	ctx.rect(player.pos.x, player.pos.y, PLAYER_WIDTH, PLAYER_HEIGHT);
	ctx.fillStyle = PLAYER_COLOR;
	ctx.fill();
}

/**
 * @brief Draw ball  on screen
*/
function draw_ball(ball: Ball) {
	currTime = Date.now();
	if (!ctx)
		throw new Error("Context not found.");
	ctx.beginPath();
	ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, 2 * Math.PI);
	if (currTime - lastTime > 1000) {
		ball_color = "#FF0000";
		lastTime = currTime;
	}
	if (currTime - lastTime > 200)
		ball_color = "#FFFFFF";
	ctx.fillStyle = ball_color;
	ctx.fill();
}

/**
 * @brief Draw the pong game frame
 */
function draw() {
	if (!canvas)
		throw new Error("Canvas context not found");
	if (!ctx)
		throw new Error("Context not found");
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	draw_terrain();
	draw_player(game.player_1);
	draw_player(game.player_2);
	draw_ball(game.ball);
	draw_score();
	ctx.closePath();
	update_player_pos();
	update_ia_pos();
	update_ball_state();
}

/**
 * @brief Draw fianal state, when player win
 */
function draw_finish() {
	if (!canvas)
		throw new Error("Canvas context not found");
	if (!ctx)
		throw new Error("Context not found");
	let msg_pos: Vec2 = {
		x: MSG_POS_RATIO * canvas.width / 2,
		y: (1 - MSG_POS_RATIO) * canvas.height
	};
	const msg_len: number = ctx.measureText("YOU WIN").width;
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	reset_ball();
	reset_player_pos();
	draw_terrain();
	draw_player(game.player_1);
	draw_player(game.player_2);
	draw_ball(game.ball);
	draw_score();

	ctx.font = `${FONT_SIZE}px ${FONT_NAME}`;
	if (game.player_1.score >= game.score_max)
		ctx.fillText("YOU WIN", msg_pos.x - msg_len, msg_pos.y);
	else
		ctx.fillText("YOU WIN", canvas.width - msg_pos.x, msg_pos.y);
	ctx.closePath();
}

/* ************************************************************************** */
/*                                  KEY HANDLER                               */
/* ************************************************************************** */
/**
 * @brief Pressed key handler
 *
 * Check if one player want to move
 */
function pressedKeyHandler(e: KeyboardEvent) {
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
 * Check if one player want to stop move
 */
function releasedKeyHandler(e: KeyboardEvent) {
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
/*                                      GAME                                  */
/* ************************************************************************** */
/**
 * @brief Reset ball position
 *
 * On new game or new round
 */
let ball_start_flag = 1;

function reset_ball() {
	game.ball.pos = { x: canvas.width / 2, y: canvas.height / 2 };
	game.ball.direction = { x: 0.45, y: 0.55 };
	game.ball.speed = 0;
	number = 1;
	ball_start_flag *= -1;
}

/**
 * @brief Set player position to the middle
 */
function reset_player_pos() {
	const player_offset = 0.05 * canvas.width;
	game.player_1.pos = { x: player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 };
	game.player_2.pos = { x: canvas.width - player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 };
}

/**
 * @brief start a new round
 *
 * Laucnh the ball
 */
function start_round() {
	game.ball.speed = BALL_INIT_SPEED;
	if (round_winner = PLAYER_ONE)
		game.ball.direction = { x: 0.45, y: 0.55 };
	else
		game.ball.direction = { x: -0.45, y: 0.55 };
}


function saveQTableToFile() {
	// Convert the Q_table to a JSON string
	const qTableJson = JSON.stringify(Q_table_training);

	// Create a Blob from the JSON string
	const blob = new Blob([qTableJson], { type: "application/json" });

	// Create an object URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create a temporary anchor element
	const a = document.createElement("a");
	a.href = url;
	a.download = `q_table_${new Date().toISOString()}.json`; // Generate file name with timestamp

	// Trigger the download
	a.click();

	// Revoke the object URL to free memory
	URL.revokeObjectURL(url);
}

/**
 * @brief Handler on game finish
 */
function finish_game() {
	draw_finish();
}

/**
 * @brief Main game loop
 */
function game_loop() {
	if (game.player_1.score >= game.score_max || game.player_2.score >= game.score_max) {
		end_game = true;
		clearInterval(game_interval);
		finish_game();
		saveQTableToFile();
		return;
	}
	if (game.new_round) {
		reset_ball();
		setTimeout(start_round, 1000);
		game.new_round = false;
	}
	draw();
}

/**
 * @brief Launch a new pong game
 */
function launch_game(p1_name: string, p2_name: string) {
	if (!canvas)
		throw new Error("Canvas not found");
	if (!p1_name || !p2_name)
		throw new Error("Invalid player name");
	game = new Pong(p1_name, p2_name, { x: canvas.width / 2, y: canvas.height / 2 });
	game.ball.direction = { x: 0.5, y: 0.5 };
	end_game = false;
	game_interval = setInterval(game_loop, 10);
}

/* ************************************************************************* */
/*                                    SPECIAL                                 */
/* ************************************************************************** */
/**
 * @brief REsize canvas for "Responsivness"
 */
function resizeCanvas() {
	if (!ctx)
		throw new Error("Context not found");
	if (!canvas)
		throw new Error("Canvas not found");

	/* Rotate canvas if needed */
	if (window.innerHeight < window.innerWidth) {
		canvas.width = window.innerWidth * 0.8;
		canvas.height = canvas.width / GOLDEN_NUMBER;

		/* Rotate */
		ctx.rotate(0); // No rotation needed for portrait
	}
	PLAYER_WIDTH = canvas.width * PLAYER_WIDTH_RATIO;
	PLAYER_HEIGHT = PLAYER_WIDTH * PLAYER_WIDTH_HEIGHT_RATIO;
	TERRAIN_LINE_FAT = 0.01 * Math.max(canvas.width, canvas.height);
	BALL_RADIUS = 0.01 * Math.min(canvas.width, canvas.height);
	FONT_SIZE = 0.08 * Math.min(canvas.width, canvas.height);
}

/**
 * @brief Load the different event for the pong game
 *
 * This function should be called when the rigth html page is loaded
 */
function load_script(p1_name: string, p2_name: string) {
	try {
		canvas = document.getElementById("pong_canvas") as HTMLCanvasElement;
		if (!canvas)
			throw new Error("Canvas not found");
		ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if (!ctx)
			throw new Error("Context not found");

		/* Set events listeners */
			/* Start game */
			resizeCanvas();
			launch_game(p1_name, p2_name);
		document.addEventListener("keydown", pressedKeyHandler, false);
		document.addEventListener("keyup", releasedKeyHandler, false);
		window.addEventListener("resize", resizeCanvas); /* Resize "Responsivness" attempt */
	}
	catch (err: any) {
		console.log(err);
	}
}
