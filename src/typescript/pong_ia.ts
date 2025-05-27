/* ************************************************************************** */
/*                                GLOBAL VARIABLES                            */
/* ************************************************************************** */
/*
 * Defnining canvas and context */
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var	start_button: HTMLButtonElement;
var	reset_button: HTMLButtonElement;

/*
 * Define drawing var
 */
const	GOLDEN_NUMBER: number = 1.618033;
const	PLAYER_WIDTH_RATIO: number = 0.09;
const	PLAYER_WIDTH_HEIGHT_RATIO: number = 10;
var		PLAYER_HEIGHT: number;
var		PLAYER_WIDTH: number;
const	PLAYER_COLOR: string = "#FFFFFF";
const	PLAYER_SPEED: number = 7;

/* Score + Text */
const	FONT_NAME: string = "sans-serif";
var		FONT_SIZE: number;
const	SCORE_POS_RATIO: number = 0.9;
const	MSG_POS_RATIO: number = 0.7;

/* Ball */
const	BALL_INIT_SPEED: number = 8;
const	BALL_COLOR: string = "#FFFFFF";
const	BALL_MAX_SPEED: number = 50;
var		BALL_RADIUS: number;
/* Terrain draw */
const	TERRAIN_COLOR: string = "#FFFFFF";
var		TERRAIN_LINE_FAT: number;

/* Game status variable */
const	PLAYER_ONE: number = 1;
const	PLAYER_TWO: number = 2;
var		game: Pong;
var		end_game: boolean;
var		game_interval: NodeJS.Timeout | number;
var		round_winner: number;
var		p1_upPressed: boolean = false;
var		p1_downPressed: boolean = false;
var		p2_upPressed: boolean = false;
var		p2_downPressed: boolean = false;

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
							{ x: player_offset, y: (canvas.height - PLAYER_WIDTH) / 2});
		this.player_2 = new Player(player_2_name,
						 { x: canvas.width - player_offset - PLAYER_HEIGHT, y: (canvas.height - PLAYER_WIDTH) / 2 });
		this.ball = new Ball(center);
		this.score_max = 30000;
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
	let score_pos: Vec2 = { x: SCORE_POS_RATIO * canvas.width / 2,
		y: (1 - SCORE_POS_RATIO) * canvas.height };
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
	// if (window.innerWidth > window.innerHeight) {
	// 	ctx.rect(0, 0, canvas.width, TERRAIN_LINE_FAT); // Top line
	// 	ctx.rect(0, 0, TERRAIN_LINE_FAT, canvas.height); // Left line
	// 	ctx.rect(0, canvas.height - TERRAIN_LINE_FAT, canvas.width, TERRAIN_LINE_FAT); // Bottom line
	// 	ctx.rect(canvas.width - TERRAIN_LINE_FAT, 0, TERRAIN_LINE_FAT, canvas.height); // Right line
	// }
	// else {
	// 	ctx.rect(0, 0, canvas.height, TERRAIN_LINE_FAT); // Top line
	// 	ctx.rect(0, 0, TERRAIN_LINE_FAT, canvas.width); // Left line
	// 	ctx.rect(0, canvas.width - TERRAIN_LINE_FAT, canvas.height, TERRAIN_LINE_FAT); // Bottom line
	// 	ctx.rect(canvas.height - TERRAIN_LINE_FAT, 0, TERRAIN_LINE_FAT, canvas.width); // Right line
	// }
	ctx.rect((canvas.width - TERRAIN_LINE_FAT) / 2, 0, TERRAIN_LINE_FAT, canvas.height);
	ctx.fillStyle = TERRAIN_COLOR;
	ctx.fill();
}

/**
 * @brief Update ball direction and speed on collision
 */
function update_ball_state() {
	let	p1 = game.player_1;
	let	p2 = game.player_2;
	let	ball = game.ball;
	let	dir = game.ball.direction;
	// let	pos = game.ball.pos;
	// let	speed = game.ball.speed;
  let	ball_next_pos = { x: ball.pos.x + ball.speed * dir.x, y: ball.pos.y + ball.speed * dir.y};

	/* Check for wall collision */
	if (ball_next_pos.y > canvas.height - BALL_RADIUS || ball_next_pos.y < BALL_RADIUS)
		dir.y = -dir.y;
	/* Check if player 1 touch the ball */
	if ((ball.pos.x > p1.pos.x && ball.pos.x < p1.pos.x + PLAYER_HEIGHT)
			&& (ball.pos.y > p1.pos.y && ball.pos.y < p1.pos.y + PLAYER_WIDTH)) {
		dir.x = -dir.x;
		game.ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
	}
	/* Check if player 2 touch the ball */
	if ((ball.pos.x > p2.pos.x && ball.pos.x < p2.pos.x + PLAYER_HEIGHT)
			&& (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_WIDTH)) {
		dir.x = -dir.x;
		game.ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
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
  if (truePong) {
    socket.send(JSON.stringify({type: 'moveBall', x: ball.pos.x, y: ball.pos.y, gameid: gameId}));
    game.ball.pos = { x: game.ball.pos.x + game.ball.direction.x * game.ball.speed,
              y: game.ball.pos.y + game.ball.direction.y * game.ball.speed };
  }
  // console.log("Sended ball pos x: " + game.ball.pos.x);
  // console.log("Sended ball pos y: " + game.ball.pos.y);
}

/**
 * @brief Move player
 */
function update_player_pos() {
	let	p1 = game.player_1;
	let	p2 = game.player_2;

	if (!canvas)
		throw new Error("Canvas not found");
	/* Update position */
	if (p1_upPressed && !p1_downPressed)
		p1.pos.y -= PLAYER_SPEED;
	if (!p1_upPressed && p1_downPressed)
		p1.pos.y += PLAYER_SPEED;
	if (p2_upPressed && !p2_downPressed)
		p2.pos.y -= PLAYER_SPEED;
	if (!p2_upPressed && p2_downPressed)
		p2.pos.y += PLAYER_SPEED;

	/* Check for out of bound */
	if (p1.pos.y > canvas.height - PLAYER_WIDTH)
		p1.pos.y = canvas.height - PLAYER_WIDTH;
	if (p1.pos.y < 0)
		p1.pos.y = 0;
	if (p2.pos.y > canvas.height - PLAYER_WIDTH)
		p2.pos.y = canvas.height - PLAYER_WIDTH;
	if (p2.pos.y < 0)
		p2.pos.y = 0;
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
	ctx.rect(player.pos.x, player.pos.y, PLAYER_HEIGHT, PLAYER_WIDTH);
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
	let msg_pos: Vec2 = { x: MSG_POS_RATIO * canvas.width / 2,
		y: (1 - MSG_POS_RATIO) * canvas.height };
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
	if (e.key === "Up" || e.key === "ArrowUp") {
    if (playerSide == 'p1')
      p1_upPressed = true;
    else
      p2_upPressed = true;
    socket.send(JSON.stringify({type: 'pressed', direction: 'up', opponent: opponent, gameid: gameId}));
  }
	if (e.key === "Down" || e.key === "ArrowDown") {
    if (playerSide == 'p1')
      p1_downPressed = true;
    else
      p2_downPressed = true;
    socket.send(JSON.stringify({type: 'pressed', direction: 'down', opponent: opponent, gameid: gameId}));
  }
}


/**
 * @brief Released key handler
 *
 * Check if one player want to stop move
 */
function releasedKeyHandler(e: KeyboardEvent) {
	if (e.key === "Up" || e.key === "ArrowUp") {
    if (playerSide == 'p1')
      p1_upPressed = false;
    else
      p2_upPressed = false;
    socket.send(JSON.stringify({type: 'released', direction: 'up', opponent: opponent, gameid: gameId}));
  }
	if (e.key === "Down" || e.key === "ArrowDown") {
    if (playerSide == 'p1')
      p1_downPressed = false;
    else
      p2_downPressed = false;
    socket.send(JSON.stringify({type: 'released', direction: 'down', opponent: opponent, gameid: gameId}));
  }
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
	game.player_1.pos = { x: player_offset, y: (canvas.height - PLAYER_WIDTH) / 2};
	game.player_2.pos = { x: canvas.width - player_offset - PLAYER_HEIGHT, y: (canvas.height - PLAYER_WIDTH) / 2 };
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
		return ;
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
	PLAYER_WIDTH = canvas.width * PLAYER_WIDTH_RATIO;
	PLAYER_HEIGHT = PLAYER_WIDTH / PLAYER_WIDTH_HEIGHT_RATIO;
	TERRAIN_LINE_FAT = 0.01 * Math.max(canvas.width, canvas.height);
	BALL_RADIUS = 0.01 * Math.min(canvas.width, canvas.height);
	FONT_SIZE = 0.08 * Math.min(canvas.width, canvas.height);
}

/**
 * @brief Load the different event for the pong game
*
* This function should be called when the rigth html page is loaded
*/

function ft_pong() {
	const local_user = { name: "Player1", id: 1 };  // exemple d'objet utilisateur
	const opponent = { name: "AI", id: 0 };         // exemple d’adversaire
	try {
		canvas = document.getElementById("pong_canvas") as HTMLCanvasElement;
		if (!canvas)
			throw new Error("Canvas not found");
		ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if (!ctx)
			throw new Error("Context not found");
      canvas.style.display = 'block';
			resizeCanvas();
			launch_game(local_user.name, opponent.name);
		document.addEventListener("keydown", pressedKeyHandler, false);
		document.addEventListener("keyup", releasedKeyHandler, false);
		window.addEventListener("resize", resizeCanvas); /* Resize
														  * "Responsivness" attempt
														  */
	}
	catch(err: any) {
		console.log(err);
	}
}

ft_pong(); /* Should be called when the right html is loaded */