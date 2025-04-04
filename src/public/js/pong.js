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
const GOLDEN_NUMBER = 1.618033;
const PLAYER_WIDTH_RATIO = 0.09;
const PLAYER_WIDTH_HEIGHT_RATIO = 10;
var PLAYER_HEIGHT;
var PLAYER_WIDTH;
const PLAYER_COLOR = "#FFFFFF";
const PLAYER_SPEED = 7;
/* Score + Text */
const FONT_NAME = "sans-serif";
var FONT_SIZE;
const SCORE_POS_RATIO = 0.9;
const MSG_POS_RATIO = 0.7;
/* Ball */
const BALL_INIT_SPEED = 8;
const BALL_COLOR = "#FFFFFF";
const BALL_MAX_SPEED = 50;
var BALL_RADIUS;
/* Terrain draw */
const TERRAIN_COLOR = "#FFFFFF";
var TERRAIN_LINE_FAT;
/* Game status variable */
const PLAYER_ONE = 1;
const PLAYER_TWO = 2;
var game;
var end_game;
var game_interval;
var round_winner;
var p1_upPressed = false;
var p1_downPressed = false;
var p2_upPressed = false;
var p2_downPressed = false;
class Player {
    constructor(name, pos) {
        this.name = name;
        this.score = 0;
        this.pos = pos;
    }
}
class Ball {
    constructor(pos) {
        this.pos = pos;
        this.direction = { x: 0, y: 0 };
        this.speed = BALL_INIT_SPEED;
    }
}
class Pong {
    constructor(player_1_name, player_2_name, center) {
        if (!canvas)
            throw new Error("Canvas not found.");
        const player_offset = 0.05 * canvas.width;
        this.player_1 = new Player(player_1_name, { x: player_offset, y: (canvas.height - PLAYER_WIDTH) / 2 });
        this.player_2 = new Player(player_2_name, { x: canvas.width - player_offset - PLAYER_HEIGHT, y: (canvas.height - PLAYER_WIDTH) / 2 });
        this.ball = new Ball(center);
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
function draw_score() {
    if (!ctx)
        throw new Error("Context not found");
    let score_pos = { x: SCORE_POS_RATIO * canvas.width / 2,
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
    game.ball.pos = { x: game.ball.pos.x + game.ball.direction.x * game.ball.speed,
        y: game.ball.pos.y + game.ball.direction.y * game.ball.speed };
}
/**
 * @brief Move player
 */
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
function draw_player(player) {
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
function draw_ball(ball) {
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
    let msg_pos = { x: MSG_POS_RATIO * canvas.width / 2,
        y: (1 - MSG_POS_RATIO) * canvas.height };
    const msg_len = ctx.measureText("YOU WIN").width;
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
function pressedKeyHandler(e) {
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
function releasedKeyHandler(e) {
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
    game.player_1.pos = { x: player_offset, y: (canvas.height - PLAYER_WIDTH) / 2 };
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
function launch_game(p1_name, p2_name) {
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
function load_script() {
    try {
        /* Set var */
        start_button = document.getElementById("button_start_game");
        if (!start_button)
            throw new Error("Start button not found.");
        reset_button = document.getElementById("reset_button");
        if (!reset_button)
            throw new Error("Reset button not found.");
        canvas = document.getElementById("pong_canvas");
        if (!canvas)
            throw new Error("Canvas not found");
        ctx = canvas.getContext("2d");
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
        window.addEventListener("resize", resizeCanvas); /* Resize
                                                          * "Responsivness" attempt
                                                          */
    }
    catch (err) {
        console.log(err);
    }
}
load_script(); /* Should be called when the right html is loaded */
