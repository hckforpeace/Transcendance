"use strict";
/* ************************************************************************** */
/*                                GLOBAL VARIABLES                            */
/* ************************************************************************** */
/*
 * Defnining canvas and context */
var canvas;
var ctx;
var start_button;
var reset_button;
/*
 * Define drawing var
 */
const GOLDEN_NUMBER_REMOTE = 1.618033;
const PLAYER_WIDTH_RATIO_REMOTE = 0.09;
const PLAYER_WIDTH_HEIGHT_RATIO_REMOTE = 10;
var PLAYER_HEIGHT;
var PLAYER_WIDTH;
const PLAYER_COLOR_REMOTE = "#FFFFFF";
const PLAYER_SPEED_REMOTE = 7;
/* Score + Text */
const FONT_NAME_REMOTE = "sans-serif";
var FONT_SIZE;
const SCORE_POS_RATIO_REMOTE = 0.9;
const MSG_POS_RATIO_REMOTE = 0.7;
/* BallRemote */
const BALL_INIT_SPEED_REMOTE = 8;
const BALL_COLOR = "#FFFFFF";
const BALL_MAX_SPEED_REMOTE = 50;
var BALL_RAD2US;
/* Terrain draw */
const TERRAIN_COLOR_REMOTE = "#FFFFFF";
var TERRAIN_LINE_FAT;
/* Game status variable */
const PLAYER_ONE_REMOTE = 1;
const PLAYER_TWO_REMOTE = 2;
var game_remote;
var end_game_remote;
var game_interval_remote;
var round_winner_remote;
var p1_upPressed_remote = false;
var p1_downPressed_remote = false;
var p2_upPressed_remote = false;
var p2_downPressed_remote = false;
class PlayerRemote {
    constructor(name, pos) {
        this.name = name;
        this.score = 0;
        this.pos = pos;
    }
}
class BallRemote {
    constructor(pos) {
        this.pos = pos;
        this.direction = { x: 0, y: 0 };
        this.speed = BALL_INIT_SPEED_REMOTE;
    }
}
class PongRemote {
    constructor(player_1_name, player_2_name, center) {
        if (!canvas)
            throw new Error("Canvas not found.");
        const player_offset = 0.05 * canvas.width;
        this.player_1 = new PlayerRemote(player_1_name, { x: player_offset, y: (canvas.height - PLAYER_WIDTH) / 2 });
        this.player_2 = new PlayerRemote(player_2_name, { x: canvas.width - player_offset - PLAYER_HEIGHT, y: (canvas.height - PLAYER_WIDTH) / 2 });
        this.ball = new BallRemote(center);
        this.score_max = 5;
        this.new_round = true;
    }
}
/* ************************************************************************** */
/*                                       DRAW                                 */
/* ************************************************************************** */
/**
 * @brief Draw player score
 */
function draw_score_remote() {
    if (!ctx)
        throw new Error("Context not found");
    let score_pos = { x: SCORE_POS_RATIO_REMOTE * canvas.width / 2,
        y: (1 - SCORE_POS_RATIO_REMOTE) * canvas.height };
    /* Calculate score width */
    const player1ScoreWidth = ctx.measureText(`${game_remote.player_1.score}`).width;
    const player2ScoreWidth = ctx.measureText(`${game_remote.player_2.score}`).width;
    /* Draw score */
    ctx.font = `${FONT_SIZE}px ${FONT_NAME_REMOTE}`;
    ctx.fillText(`${game_remote.player_1.score}`, score_pos.x - player1ScoreWidth / 2, score_pos.y);
    ctx.fillText(`${game_remote.player_2.score}`, canvas.width - score_pos.x - player2ScoreWidth / 2, score_pos.y);
}
/**
 * @brief Draw basic pong terrain
 */
function draw_terrain_remote() {
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
    ctx.fillStyle = TERRAIN_COLOR_REMOTE;
    ctx.fill();
}
/**
 * @brief Update ball direction and speed on collision
 */
function update_ball_state_remote() {
    let p1 = game_remote.player_1;
    let p2 = game_remote.player_2;
    let ball = game_remote.ball;
    let dir = game_remote.ball.direction;
    // let	pos = game.ball.pos;
    // let	speed = game.ball.speed;
    let ball_next_pos = { x: ball.pos.x + ball.speed * dir.x, y: ball.pos.y + ball.speed * dir.y };
    /* Check for wall collision */
    if (ball_next_pos.y > canvas.height - BALL_RADIUS || ball_next_pos.y < BALL_RADIUS)
        dir.y = -dir.y;
    /* Check if player 1 touch the ball */
    if ((ball.pos.x > p1.pos.x && ball.pos.x < p1.pos.x + PLAYER_HEIGHT)
        && (ball.pos.y > p1.pos.y && ball.pos.y < p1.pos.y + PLAYER_WIDTH)) {
        dir.x = -dir.x;
        game_remote.ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
    }
    /* Check if player 2 touch the ball */
    if ((ball.pos.x > p2.pos.x && ball.pos.x < p2.pos.x + PLAYER_HEIGHT)
        && (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_WIDTH)) {
        dir.x = -dir.x;
        game_remote.ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
    }
    /* Check if player1 win a point */
    if (ball_next_pos.x > canvas.width - BALL_RADIUS) {
        game_remote.player_1.score += 1;
        game_remote.new_round = true;
    }
    /* Check if player2 win a point */
    if (ball_next_pos.x < BALL_RADIUS) {
        game_remote.player_2.score += 1;
        game_remote.new_round = true;
    }
    /* Update ball position */
    if (truePong) {
        socket.send(JSON.stringify({ type: 'moveBall', x: ball.pos.x, y: ball.pos.y, gameid: gameId }));
        game_remote.ball.pos = { x: game_remote.ball.pos.x + game_remote.ball.direction.x * game_remote.ball.speed,
            y: game_remote.ball.pos.y + game_remote.ball.direction.y * game_remote.ball.speed };
    }
    // console.log("Sended ball pos x: " + game.ball.pos.x);
    // console.log("Sended ball pos y: " + game.ball.pos.y);
}
// function update_ball_state_remote() {
// 	let	p1 = game_remote.player_1;
// 	let	p2 = game_remote.player_2;
// 	let	ball = game_remote.ball;
// 	let	dir = game_remote.ball.direction;
// 	// let	pos = game_remote.ball.pos;
// 	// let	speed = game_remote.ball.speed;
// 	let	ball_next_pos = { x: ball.pos.x + ball.speed * dir.x, y: ball.pos.y + ball.speed * dir.y};
// 	/* Check for wall collision */
// 	if (ball_next_pos.y > canvas.height - BALL_RADIUS || ball_next_pos.y < BALL_RADIUS)
// 		dir.y = -dir.y;
// 	/* Check if player 1 touch the ball */
// 	if ((ball.pos.x > p1.pos.x && ball.pos.x < p1.pos.x + PLAYER_HEIGHT)
// 			&& (ball.pos.y > p1.pos.y && ball.pos.y < p1.pos.y + PLAYER_WIDTH)) {
// 		dir.x = -dir.x;
// 		game_remote.ball.speed = Math.min(BALL_MAX_SPEED_REMOTE, ball.speed + 1);
// 	}
// 	/* Check if player 2 touch the ball */
// 	if ((ball.pos.x > p2.pos.x && ball.pos.x < p2.pos.x + PLAYER_HEIGHT)
// 			&& (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_WIDTH)) {
// 		dir.x = -dir.x;
// 		game_remote.ball.speed = Math.min(BALL_MAX_SPEED_REMOTE, ball.speed + 1);
// 	}
// 	/* Check if player1 win a point */
// 	if (ball_next_pos.x > canvas.width - BALL_RADIUS) {
// 		game_remote.player_1.score += 1;
// 		game_remote.new_round = true;
// 	}
// 	/* Check if player2 win a point */
// 	if (ball_next_pos.x < BALL_RADIUS) {
// 		game_remote.player_2.score += 1;
// 		game_remote.new_round = true;
// 	}
//   if (truePong) {
//     socket.send(JSON.stringify({type: 'moveBall', x: ball.pos.x, y: ball.pos.y, gameid: gameId}));
//     game.ball.pos = { x: game.ball.pos.x + game.ball.direction.x * game.ball.speed,
//               y: game.ball.pos.y + game.ball.direction.y * game.ball.speed };
//   }
// 	/* Update ball position */
// 	game_remote.ball.pos = { x: game_remote.ball.pos.x + game_remote.ball.direction.x * game_remote.ball.speed,
// 						y: game_remote.ball.pos.y + game_remote.ball.direction.y * game_remote.ball.speed };
// }
/**
 * @brief Move player
 */
function update_player_pos_remote() {
    let p1 = game_remote.player_1;
    let p2 = game_remote.player_2;
    if (!canvas)
        throw new Error("Canvas not found");
    /* Update position */
    if (p1_upPressed_remote && !p1_downPressed_remote)
        p1.pos.y -= PLAYER_SPEED_REMOTE;
    if (!p1_upPressed_remote && p1_downPressed_remote)
        p1.pos.y += PLAYER_SPEED_REMOTE;
    if (p2_upPressed_remote && !p2_downPressed_remote)
        p2.pos.y -= PLAYER_SPEED_REMOTE;
    if (!p2_upPressed_remote && p2_downPressed_remote)
        p2.pos.y += PLAYER_SPEED_REMOTE;
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
function draw_player_remote(player) {
    if (!canvas)
        throw new Error("Canvas not found");
    if (!ctx)
        throw new Error("Context not found");
    // ctx.beginPath();
    ctx.rect(player.pos.x, player.pos.y, PLAYER_HEIGHT, PLAYER_WIDTH);
    ctx.fillStyle = PLAYER_COLOR_REMOTE;
    ctx.fill();
    // ctx.closePath();
}
/**
 * @brief Draw ball  on screen
 */
function draw_ball_remote(ball) {
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
function draw_remote() {
    if (!canvas)
        throw new Error("Canvas context not found");
    if (!ctx)
        throw new Error("Context not found");
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_terrain_remote();
    draw_player_remote(game_remote.player_1);
    draw_player_remote(game_remote.player_2);
    draw_ball_remote(game_remote.ball);
    draw_score_remote();
    ctx.closePath();
    update_player_pos_remote();
    update_ball_state_remote();
}
/**
 * @brief Draw fianal state, when player win
 */
function draw_finish_remote() {
    if (!canvas)
        throw new Error("Canvas context not found");
    if (!ctx)
        throw new Error("Context not found");
    let msg_pos = { x: MSG_POS_RATIO_REMOTE * canvas.width / 2,
        y: (1 - MSG_POS_RATIO_REMOTE) * canvas.height };
    const msg_len = ctx.measureText("YOU WIN").width;
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    reset_ball();
    reset_player_pos_remote();
    draw_terrain_remote();
    draw_player_remote(game_remote.player_1);
    draw_player_remote(game_remote.player_2);
    draw_ball_remote(game_remote.ball);
    draw_score_remote();
    ctx.font = `${FONT_SIZE}px ${FONT_NAME_REMOTE}`;
    if (game_remote.player_1.score >= game_remote.score_max)
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
function pressedKeyHandler_remote(e) {
    if (e.key === "Up" || e.key === "ArrowUp") {
        if (playerSide == 'p1')
            p1_upPressed_remote = true;
        else
            p2_upPressed_remote = true;
        socket.send(JSON.stringify({ type: 'pressed', direction: 'up', opponent: opponent, gameid: gameId }));
    }
    if (e.key === "Down" || e.key === "ArrowDown") {
        if (playerSide == 'p1')
            p1_downPressed_remote = true;
        else
            p2_downPressed_remote = true;
        socket.send(JSON.stringify({ type: 'pressed', direction: 'down', opponent: opponent, gameid: gameId }));
    }
}
/**
 * @brief Released key handler
 *
 * Check if one player want to stop move
 */
function releasedKeyHandler_remote(e) {
    if (e.key === "Up" || e.key === "ArrowUp") {
        if (playerSide == 'p1')
            p1_upPressed_remote = false;
        else
            p2_upPressed_remote = false;
        socket.send(JSON.stringify({ type: 'released', direction: 'up', opponent: opponent, gameid: gameId }));
    }
    if (e.key === "Down" || e.key === "ArrowDown") {
        if (playerSide == 'p1')
            p1_downPressed_remote = false;
        else
            p2_downPressed_remote = false;
        socket.send(JSON.stringify({ type: 'released', direction: 'down', opponent: opponent, gameid: gameId }));
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
function reset_ball_remote() {
    game_remote.ball.pos = { x: canvas.width / 2, y: canvas.height / 2 };
    game_remote.ball.direction = { x: 0, y: 0 };
    game_remote.ball.speed = 0;
}
/**
 * @brief Set player position to the middle
 */
function reset_player_pos_remote() {
    const player_offset = 0.05 * canvas.width;
    game_remote.player_1.pos = { x: player_offset, y: (canvas.height - PLAYER_WIDTH) / 2 };
    game_remote.player_2.pos = { x: canvas.width - player_offset - PLAYER_HEIGHT, y: (canvas.height - PLAYER_WIDTH) / 2 };
}
/**
 * @brief start a new round
 *
 * Laucnh the ball
 */
function start_round_remote() {
    game_remote.ball.speed = BALL_INIT_SPEED_REMOTE;
    if (round_winner_remote = PLAYER_ONE_REMOTE)
        game_remote.ball.direction = { x: 0.45, y: 0.55 };
    else
        game_remote.ball.direction = { x: -0.45, y: 0.55 };
}
/**
 * @brief Handler on game finish
 */
function finish_game_remote() {
    draw_finish_remote();
}
/**
 * @brief Main game loop
 */
function game_loop_remote() {
    if (game_remote.player_1.score >= game_remote.score_max || game_remote.player_2.score >= game_remote.score_max) {
        end_game_remote = true;
        socket.send(JSON.stringify({ type: 'endGame', scoreP1: game_remote.player_1.score, scoreP2: game_remote.player_2.score, gameid: gameId }));
        clearInterval(game_interval_remote);
        finish_game_remote();
        return;
    }
    if (game_remote.new_round) {
        reset_ball_remote();
        setTimeout(start_round_remote, 1000);
        game_remote.new_round = false;
    }
    draw_remote();
}
/**
 * @brief Launch a new pong game
 */
function launch_game_remote(p1_name, p2_name) {
    if (!canvas)
        throw new Error("Canvas not found");
    if (!p1_name || !p2_name)
        throw new Error("Invalid player name");
    game_remote = new PongRemote(p1_name, p2_name, { x: canvas.width / 2, y: canvas.height / 2 });
    game_remote.ball.direction = { x: 0.5, y: 0.5 };
    end_game_remote = false;
    game_interval_remote = setInterval(game_loop_remote, 10);
}
/* ************************************************************************* */
/*                                    SPECIAL                                 */
/* ************************************************************************** */
/**
 * @brief REsize canvas for "Responsivness"
 */
function resizeCanvas_remote() {
    if (!ctx)
        throw new Error("Context not found");
    if (!canvas)
        throw new Error("Canvas not found");
    /* Rotate canvas if needed */
    if (window.innerHeight > window.innerWidth) {
        canvas.height = window.innerHeight * 0.8;
        canvas.width = canvas.height / GOLDEN_NUMBER_REMOTE;
        /* Rotate */
        ctx.translate(canvas.width / 2, canvas.height / 2); // Move to center
        ctx.rotate(Math.PI / 2); // Rotate 90 degrees
        ctx.translate(-canvas.height / 2, -canvas.width / 2); // Move back
    }
    else {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = canvas.width / GOLDEN_NUMBER_REMOTE;
        /* Rotate */
        ctx.rotate(0); // No rotation needed for portrait
    }
    PLAYER_WIDTH = canvas.width * PLAYER_WIDTH_RATIO_REMOTE;
    PLAYER_HEIGHT = PLAYER_WIDTH / PLAYER_WIDTH_HEIGHT_RATIO_REMOTE;
    TERRAIN_LINE_FAT = 0.01 * Math.max(canvas.width, canvas.height);
    BALL_RADIUS = 0.01 * Math.min(canvas.width, canvas.height);
    FONT_SIZE = 0.08 * Math.min(canvas.width, canvas.height);
}
/**
 * @brief Load the different event for the pong game
 *
 * This function should be called when the rigth html page is loaded
 */
function load_script_remote() {
    try {
        canvas = document.getElementById("pong_canvas");
        if (!canvas)
            throw new Error("Canvas not found");
        ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Context not found");
        canvas.style.display = 'block';
        resizeCanvas_remote();
        launch_game_remote(local_username, opponent);
        document.addEventListener("keydown", pressedKeyHandler_remote, false);
        document.addEventListener("keyup", releasedKeyHandler_remote, false);
        window.addEventListener("resize", resizeCanvas_remote);
    }
    catch (err) {
        console.log(err);
    }
}
