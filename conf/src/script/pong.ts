/* ************************************************************************** */
/*                                GLOBAL VARIABLES                            */
/* ************************************************************************** */
/*
 * Defnining canvas and context */
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var start_button: HTMLButtonElement;
var reset_button: HTMLButtonElement;

/*
 * Define drawing var
 */
const GOLDEN_NUMBER: number = 1.618033;
const PLAYER_HEIGHT_RATIO: number = 0.09;
const PLAYER_HEIGHT_HEIGHT_RATIO: number = 10;
var PLAYER_WIDTH: number;
var PLAYER_HEIGHT: number;
const PLAYER_COLOR: string = "#FFFFFF";
const PLAYER_SPEED: number = 10;

/* Score + Text */
const FONT_NAME: string = "sans-serif";
var FONT_SIZE: number;
const SCORE_POS_RATIO: number = 0.9;
const MSG_POS_RATIO: number = 0.7;

/* Ball */
const BALL_INIT_SPEED: number = 8;
const BALL_COLOR: string = "#FFFFFF";
const BALL_MAX_SPEED: number = 50;
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
var NUM_ACTIONS: number = 3;
var NUM_STATES: number = 4;
const ALPHA: number = 0.4;
const GAMMA: number = 0.7;
let EPSILON: number = 0.1;
const TRAINING: boolean = true;
const epsilon_decay_rate: number = 0.001;
let Q_table: number[][] = Array(NUM_STATES).fill([]).map(() => Array(NUM_ACTIONS).fill(0));

/* ************************************************************************** */
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
		this.direction = { x: 0, y: 0 };
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
		this.player_1 = new Player(player_1_name,
			{ x: player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 });
		this.player_2 = new Player(player_2_name,
			{ x: canvas.width - player_offset - PLAYER_WIDTH, y: (canvas.height - PLAYER_HEIGHT) / 2 });
		this.ball = new Ball(center);
		this.score_max = 115;
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
	ctx.rect((canvas.width - TERRAIN_LINE_FAT) / 2, 0, TERRAIN_LINE_FAT, canvas.height);
	ctx.fillStyle = TERRAIN_COLOR;
	ctx.fill();
}

/**
 * @brief Update ball direction and speed on collision
 */
function update_ball_state() {
	let p1 = game.player_1;
	let p2 = game.player_2;
	let ball = game.ball;
	let dir = game.ball.direction;
	// let	pos = game.ball.pos;
	// let	speed = game.ball.speed;
	let ball_next_pos = { x: ball.pos.x + ball.speed * dir.x, y: ball.pos.y + ball.speed * dir.y };

	/* Check for wall collision */
	if (ball_next_pos.y > canvas.height - BALL_RADIUS || ball_next_pos.y < BALL_RADIUS)
		dir.y = -dir.y;
	/* Check if player 1 touch the ball */
	if ((ball.pos.x > p1.pos.x && ball.pos.x < p1.pos.x + PLAYER_WIDTH)
		&& (ball.pos.y > p1.pos.y && ball.pos.y < p1.pos.y + PLAYER_HEIGHT)) {
		dir.x = -dir.x;
		// let randomFactor = (Math.random() - 0.5) * 2; // Valeur entre -1 et 1 pour un rebond plus varié
		// dir.y = randomFactor;
		game.ball.speed += 8;
	}
	/* Check if player 2 touch the ball */
	if ((ball.pos.x > p2.pos.x && ball.pos.x < p2.pos.x + PLAYER_WIDTH)
		&& (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_HEIGHT)) {
		dir.x = -dir.x;
		// let randomFactor = (Math.random() - 0.5) * 2; // Valeur entre -1 et 1 pour un rebond plus varié
		// dir.y = randomFactor;
		game.ball.speed += 8;

	}

	/* Check if player1 win a point */
	if (ball_next_pos.x > canvas.width - BALL_RADIUS) {
		game.player_1.score += 1;
		game.new_round = true;
	}
	/* Check if player2 win a point */
	if (ball_next_pos.x < BALL_RADIUS) {
		game.player_2.score += 1;
		game.new_round = true;
	}

	/* Update ball position */
	game.ball.pos = {
		x: game.ball.pos.x + game.ball.direction.x * 7,
		y: game.ball.pos.y + game.ball.direction.y * 7
	};
}

/**
 * @brief Move player
 */

/* IA Q_LEARNING MOVES */

/* choose a state in function of the position of the ball in the screen, which is divide by 3 */
/* function getState(): number {
	let ball = game.ball;

	if(ball.direction.y < 0 && ball.direction.x > 0 && ball.pos.y < game.player_2.pos.y)
		return(1);
	else if(ball.direction.x > 0  && ball.direction.y > 0 && ball.pos.y > game.player_2.pos.y)
		return(2);
	return (0);
} */

function getState(): number {
	let ball = game.ball;
	let p2 = game.player_2;

	if (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_HEIGHT) {
		console.log("CENTER");
		return (0);
	}
	if (ball.pos.y < p2.pos.y - PLAYER_HEIGHT / 2) {
		console.log("BEFORE");
		return (1);
	}
	if (ball.pos.y > p2.pos.y + PLAYER_HEIGHT / 2) {
		console.log("AFTER");
		return (2);
	}
	return (0);
}


/* choose an action according to the epsilon value : this is called the epsilon-greedy */
function chooseAction(state: number): number {
	if (Math.random() < EPSILON) {
		EPSILON = Math.max(EPSILON * 0.999, 0.01);
		return (Math.floor(Math.random() * NUM_ACTIONS));
	}
	else {
		let best_action = Q_table[state].indexOf(Math.max(...Q_table[state]));
		// console.log("best action index : ", best_action);
		return (best_action);
	}
}

/* Use the formula of the algorithm */
function updateTable(state: number, action: number, reward: number, next_state: number) {
	// Récupérer la valeur actuelle de Q pour l'état et l'action choisis
	const current_q = Q_table[state][action];

	// Trouver la valeur maximale de Q pour le prochain état (next_state)
	const max_future_q = Math.max(...Q_table[next_state]);

	// Calculer la nouvelle valeur de Q en appliquant la formule de Q-learning
	const new_q = current_q + ALPHA * (reward + GAMMA * max_future_q - current_q);

	// Mettre à jour la Q-table avec la nouvelle valeur de Q
	Q_table[state][action] = new_q;
}

function get_reward() : number {
	const max_reward = PLAYER_HEIGHT / 2;
	const min_reward = -max_reward;
	const y_distance = Math.abs(game.player_2.pos.y - PLAYER_HEIGHT / 2 - game.ball.pos.y);
	let reward = -(y_distance / screen.height) * max_reward;

	if (y_distance < PLAYER_HEIGHT / 2) {
		reward += max_reward;
	}

	return Math.max(min_reward, reward);
}

let lastTime = Date.now(); // Variable globale pour stocker le temps du dernier rafraîchissement de l'IA
let currTime = 0;
let last_p2_pos_y = 0;
let action = 0;
let state = 0;

function update_ia_pos() {
	currTime = Date.now();

	// if (currTime - lastTime > 1) {
		state = getState();
		action = chooseAction(state);  // Action choisie par l'IA
		lastTime = currTime;
	// }
	let p2 = game.player_2; // Référence à l'IA
	let ball = game.ball; // Référence à la balle

	if (state == 1) {
		p2.pos.y -= PLAYER_SPEED;
	}
	else if(state == 2)
		p2.pos.y += PLAYER_SPEED;

	// Empêcher l'IA de sortir des limites du canvas
	if (p2.pos.y < 0) p2.pos.y = 0; // Limite en haut
	if (p2.pos.y > canvas.height - PLAYER_HEIGHT) p2.pos.y = canvas.height - PLAYER_HEIGHT; // Limite en bas	

	let reward = get_reward();
	// Mise à jour de la Q-table de l'IA après le déplacement
	let next_state = getState();
	updateTable(state, action, reward, next_state);


	// Affichage du mouvement pour le débogage (facultatif)
	// console.log("State:", state);
	// console.log(Q_table);
}


function update_player_pos() {
	let p1 = game.player_1;
	let p2 = game.player_2;
	if (!canvas)
		throw new Error("Canvas not found");
	/* Update position */
	if (p1_upPressed && !p1_downPressed)
		p1.pos.y -= PLAYER_SPEED;
	if (!p1_upPressed && p1_downPressed)
		p1.pos.y += PLAYER_SPEED;
	// if (p2_upPressed && !p2_downPressed)
	// 	p2.pos.y -= PLAYER_SPEED;
	// if (!p2_upPressed && p2_downPressed)
	// 	p2.pos.y += PLAYER_SPEED;

	/* Check for out of bound */
	if (p1.pos.y > canvas.height - PLAYER_HEIGHT)
		p1.pos.y = canvas.height - PLAYER_HEIGHT;
	if (p1.pos.y < 0)
		p1.pos.y = 0;
	// if (p2.pos.y > canvas.height - PLAYER_HEIGHT)
	// 	p2.pos.y = canvas.height - PLAYER_HEIGHT;
	// if (p2.pos.y < 0)
	// 	p2.pos.y = 0;
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
	// ctx.closePath();
}

/**
 * @brief Draw ball  on screen
 */
function draw_ball(ball: Ball) {
	if (!ctx)
		throw new Error("Context not found.");
	ctx.beginPath();
	ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, 2 * Math.PI);
	ctx.fillStyle = BALL_COLOR;
	ctx.fill();
	// ctx.closePath();
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
function reset_ball() {
	game.ball.pos = { x: canvas.width / 2, y: canvas.height / 2 };
	game.ball.direction = { x: 0, y: 0 };
	game.ball.speed = 0;
}

/**
 * @brief Set player position to the middle
 */
function reset_player_pos() {
	const player_offset = 0.05 * canvas.width;
	game.player_1.pos = { x: player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 };
	game.player_2.pos = { x: canvas.width - player_offset - PLAYER_WIDTH, y: (canvas.height - PLAYER_HEIGHT) / 2 };
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
	if (window.innerHeight > window.innerWidth) {
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height / GOLDEN_NUMBER;

		/* Rotate */
		ctx.translate(canvas.width / 2, canvas.height / 2); // Move to center
		ctx.rotate(Math.PI / 2); // Rotate 90 degrees
		ctx.translate(-canvas.height / 2, -canvas.width / 2); // Move back
	}
	else {
		canvas.width = window.innerWidth * 0.8;
		canvas.height = canvas.width / GOLDEN_NUMBER;

		/* Rotate */
		ctx.rotate(0); // No rotation needed for portrait
	}
	PLAYER_HEIGHT = canvas.width * PLAYER_HEIGHT_RATIO;
	PLAYER_WIDTH = PLAYER_HEIGHT / PLAYER_HEIGHT_HEIGHT_RATIO;
	TERRAIN_LINE_FAT = 0.01 * Math.max(canvas.width, canvas.height);
	BALL_RADIUS = 0.01 * Math.min(canvas.width, canvas.height);
	FONT_SIZE = 0.08 * Math.min(canvas.width, canvas.height);
}

/**
 * @brief Load the different event for the pong game
 *
 * This function should be called when the rigth html page is loaded
 */
function load_script() {
	try {
		/* Set var */
		start_button = document.getElementById("button_start_game") as HTMLButtonElement;
		if (!start_button)
			throw new Error("Start button not found.");
		reset_button = document.getElementById("reset_button") as HTMLButtonElement;
		if (!reset_button)
			throw new Error("Reset button not found.");
		canvas = document.getElementById("pong_canvas") as HTMLCanvasElement;
		if (!canvas)
			throw new Error("Canvas not found");
		ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if (!ctx)
			throw new Error("Context not found");

		/* Set events listeners */
		start_button.addEventListener("click", () => {
			canvas.style.display = 'block';
			start_button.style.display = 'none';
			reset_button.style.display = 'block';
			/* Start game */
			resizeCanvas();
			launch_game("Jojo", "Lili");
		});
		reset_button.addEventListener("click", () => {
			canvas.style.display = 'none';
			start_button.style.display = 'block';
			reset_button.style.display = 'none';

		});
		document.addEventListener("keydown", pressedKeyHandler, false);
		document.addEventListener("keyup", releasedKeyHandler, false);
		window.addEventListener("resize", resizeCanvas); /* Resize "Responsivness" attempt */
	}
	catch (err: any) {
		console.log(err);
	}
}

load_script(); /* Should be called when the right html is loaded */
