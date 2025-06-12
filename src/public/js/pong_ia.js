"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const TRAINING = false;
/* ************************************************************************** */
/*                                GLOBAL VARIABLES                            */
/* ************************************************************************** */
/*
* Defnining canvas and context */
var canvas;
var ctx;
var reset_button;
/*
 * Define drawing var
 */
const GOLDEN_NUMBER = 1.618033;
const PLAYER_WIDTH_RATIO = 0.009;
const PLAYER_WIDTH_HEIGHT_RATIO = 10;
var PLAYER_HEIGHT;
var PLAYER_WIDTH;
const PLAYER_COLOR = "#FFFFFF";
const PLAYER_SPEED = 10;
/* Score + Text */
const FONT_NAME = "sans-serif";
var FONT_SIZE;
const SCORE_POS_RATIO = 0.9;
const MSG_POS_RATIO = 0.7;
/* Ball */
let ball_color = "#FFFFFF";
const BALL_INIT_SPEED = 10;
//const BALL_COLOR: string = "#FFFFFF";
const BALL_MAX_SPEED = 12;
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
/* IA Q_algorythm value */
let rewards = 0;
var NUM_ACTIONS = 3;
var NUM_STATES = 3;
const ALPHA = 0.2;
const GAMMA = 0.7;
let EPSILON = 1;
let EPSILON_MIN = 0.2;
const epsilon_decay_rate = 0.00001;
let Q_table = [[21.31108513974205, 75.20125498633924, 23.204609907685626], [-7.970433733155105, -7.631723162062445, -6.697510940912556], [-53.43026720319538, -29.41950667903459, -54.90903501468911]];
let Q_table_training = Array.from({ length: NUM_STATES }, () => new Array(NUM_ACTIONS).fill(0));
class Player {
    constructor(name, pos) {
        this.name = name;
        this.score = 0;
        this.pos = pos;
        this.speed = PLAYER_SPEED;
    }
}
class Ball {
    constructor(pos) {
        this.pos = pos;
        this.direction = { x: 0.45, y: 0.55 };
        this.speed = BALL_INIT_SPEED;
    }
}
class Pong {
    constructor(player_1_name, player_2_name, center) {
        if (!canvas)
            throw new Error("Canvas not found.");
        const player_offset = 0.05 * canvas.width;
        this.player_1 = new Player(player_1_name, { x: player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 });
        this.player_2 = new Player(player_2_name, { x: canvas.width - player_offset, y: (canvas.height - PLAYER_HEIGHT) / 2 });
        this.ball = new Ball(center);
        if (TRAINING)
            this.score_max = 150;
        else
            this.score_max = 1;
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
    let score_pos = {
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
    /* Check for wall collision */
    if (ball_next_pos.y > canvas.height - BALL_RADIUS || ball_next_pos.y < BALL_RADIUS)
        dir.y = -dir.y;
    if ((ball.pos.x > p1.pos.x && ball.pos.x < p1.pos.x + PLAYER_WIDTH)
        && (ball.pos.y > p1.pos.y && ball.pos.y < p1.pos.y + PLAYER_HEIGHT) && number == 0) {
        number = 1;
        dir.x = -dir.x;
        dir.y += 0.08;
        game.ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 1);
    }
    if ((ball.pos.x > p2.pos.x && ball.pos.x < p2.pos.x + PLAYER_WIDTH)
        && (ball.pos.y > p2.pos.y && ball.pos.y < p2.pos.y + PLAYER_HEIGHT) && number == 1) {
        number = 0;
        dir.x = -dir.x;
        dir.y += -0.08;
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
function getFutureY() {
    const ball = game.ball;
    const pos = { x: ball.pos.x, y: ball.pos.y };
    const dir = { x: ball.direction.x, y: ball.direction.y };
    const speed = ball.speed;
    const playerX = game.player_2.pos.x;
    const height = canvas.height;
    if (dir.x <= 0 || ball.speed == 0)
        return (game.player_2.pos.y);
    let x = pos.x;
    let y = pos.y;
    let dx = dir.x * speed;
    let dy = dir.y * speed;
    while (x < playerX) {
        let timeToWall = dy > 0 ? (height - BALL_RADIUS - y) / dy : (BALL_RADIUS - y) / dy;
        let timeToPaddle = (playerX - x) / dx;
        if (timeToPaddle < timeToWall) {
            y += dy * timeToPaddle;
            break;
        }
        else {
            // rebond contre mur
            x += dx * timeToWall;
            y += dy * timeToWall;
            dy = -dy;
        }
    }
    return (y - PLAYER_HEIGHT / 2);
}
function getState() {
    let ball = game.ball;
    let p2 = game.player_2;
    if (p2.pos.y < future_pos_y)
        return (1);
    if (p2.pos.y > future_pos_y + PLAYER_HEIGHT)
        return (2);
    return (0);
}
/* choose an action according to the epsilon value : this is called the epsilon-greedy */
function chooseAction(state) {
    let best_action = 0;
    if (TRAINING) {
        EPSILON = Math.max(EPSILON_MIN, EPSILON * (1 - epsilon_decay_rate));
        // console.log("EPSILON -> ", EPSILON);
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
function updateTable(state, action, reward, next_state) {
    const td_target = reward + GAMMA * Math.max(...Q_table_training[next_state]);
    const td_error = td_target - Q_table_training[state][action];
    Q_table_training[state][action] += ALPHA * td_error;
}
function get_reward() {
    const max_reward = PLAYER_HEIGHT / 2;
    const min_reward = -max_reward;
    const y_distance = Math.abs(game.player_2.pos.y + (PLAYER_HEIGHT / 2) - future_pos_y);
    let reward = -(y_distance / canvas.height) * max_reward;
    if (y_distance < PLAYER_HEIGHT / 2)
        reward += max_reward;
    return Math.max(min_reward, reward);
}
let lastTimeIA = Date.now();
let lastTime = Date.now();
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
    state = getState();
    action = chooseAction(state); // Action choisie par l'IA
    // console.log("State = ", state, "Action = ", action);
    if (action == 1)
        p2.pos.y -= p2.speed;
    if (action == 2)
        p2.pos.y += p2.speed;
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
            p1.pos.y -= p1.speed;
        if (!p1_upPressed && p1_downPressed)
            p1.pos.y += p1.speed;
        if (p2_upPressed && !p2_downPressed)
            p2.pos.y -= p2.speed;
        if (!p2_upPressed && p2_downPressed)
            p2.pos.y += p2.speed;
    }
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
function draw_player(player) {
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
function draw_ball(ball) {
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
    let msg_pos = {
        x: MSG_POS_RATIO * canvas.width / 2,
        y: (1 - MSG_POS_RATIO) * canvas.height
    };
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
    resizeCanvas();
    ctx.font = `${FONT_SIZE}px ${FONT_NAME}`;
    if (game.player_1.score >= game.score_max)
        ctx.fillText("YOU WIN", msg_pos.x - msg_len, msg_pos.y);
    else
        ctx.fillText("YOU WIN", canvas.width - msg_pos.x, msg_pos.y);
    game.player_1.score = 0;
    game.player_2.score = 0;
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
    if (round_winner === PLAYER_ONE)
        game.ball.direction = { x: -0.45, y: 0.55 };
    else
        game.ball.direction = { x: 0.45, y: 0.55 };
}
function saveQTableToFile() {
    const qTableJson = JSON.stringify(Q_table_training);
    const blob = new Blob([qTableJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `q_table_${new Date().toISOString()}.json`; // Generate file name with timestamp
    a.click();
    // Revoke the object URL to free memory
    URL.revokeObjectURL(url);
}
function update_user_stats(p1_score, p2_score) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/updateUserStats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ p1_score, p2_score }) // Send the scores to the backend
            });
            if (!response.ok) {
                throw new Error('Failed to update user stats');
            }
        }
        catch (error) {
            console.error('Error updating user stats:', error);
        }
    });
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
        update_user_stats(game.player_1.score, game.player_2.score);
        if (TRAINING == true)
            saveQTableToFile();
        finish_game();
        clearInterval(game_interval);
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
    resizeCanvas();
    game = new Pong(p1_name, p2_name, { x: canvas.width / 2, y: canvas.height / 2 });
    game.ball.direction = { x: 0.5, y: 0.5 };
    end_game = false;
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
    // Fixe une taille constante au canvas
    canvas.width = screen.width * 0.73;
    canvas.height = screen.height * 0.73;
    PLAYER_WIDTH = canvas.width * PLAYER_WIDTH_RATIO;
    PLAYER_HEIGHT = PLAYER_WIDTH * PLAYER_WIDTH_HEIGHT_RATIO;
    TERRAIN_LINE_FAT = 0.01 * Math.max(canvas.width, canvas.height);
    BALL_RADIUS = 0.01 * Math.min(canvas.width, canvas.height);
    FONT_SIZE = 0.08 * Math.min(canvas.width, canvas.height);
}
// Function to fetch and update profile data 
const getUserName = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('/api/profile/info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok)
        throw new Error('Failed to fetch');
    return yield response.json();
});
/**
 * @brief Load the different event for the pong game
 *
 * This function should be called when the rigth html page is loaded
 */
function load_script() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield getUserName();
            const leftName = document.getElementById("left-player-name");
            if (leftName)
                leftName.innerHTML = data.name;
            canvas = document.getElementById("pong_canvas");
            if (!canvas)
                throw new Error("Canvas not found");
            ctx = canvas.getContext("2d");
            if (!ctx)
                throw new Error("Context not found");
            /* Start game */
            if (game_interval)
                clearInterval(game_interval);
            game_interval = setInterval(game_loop, 8);
            console.log("JE LANCE LE SCRIPT ! ");
            launch_game(data.name, "Bot");
            /* Set events listeners */
            document.addEventListener("keydown", pressedKeyHandler, false);
            document.addEventListener("keyup", releasedKeyHandler, false);
        }
        catch (err) {
            console.log(err);
        }
    });
}
