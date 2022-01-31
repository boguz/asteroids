import { GameState, KeysInterface, LevelInterface } from "./types/types";
import { Player } from "./classes/Player.js";
import { utils } from "./utils/utils.js";
import { Bullet } from "./classes/Bullet.js";
import { Infos } from "./classes/Infos.js";
import { Roid } from "./classes/Roid.js";
import { LEVELS } from "./levels.js";
import { isBulletCollidingWithRoid } from "./utils/collisionDetection.js";

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const START_SCREEN = document.querySelector('.start') as HTMLElement;
const INFOS_SCREEN = document.querySelector('.infos') as HTMLElement;

const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
const STARTING_LIVES = 3;
const COLORS = {
	BG: utils('--color-bg'),
	WHITE: utils('--color-white'),
	BULLET: 'hsl(337, 100%, 65%)',
	ROIDS: [
		'hsl(224, 100%, 58%)',
		'hsl(198, 100%, 50%)',
		'hsl(186, 100%, 50%)',
		'hsl(165, 82%, 51%)',
		'hsl(150, 100%, 45%)',
	]
};
const KEYS: KeysInterface = {
	LEFT: false,
	RIGHT: false,
	UP: false,
	SPACE: false,
}
let GAME_STATE: GameState = GameState.START;
let player: Player;
let infos: Infos;

let bullets: Bullet[] = [];
let roids: Roid[] = [];

let level = 1;
let currentLevel: LevelInterface;
let score = 0;
let lives = STARTING_LIVES;

let prevTime = performance.now();
let accumulatedFrameTime = 0;

function handleKeydown(event: KeyboardEvent) {
	if (GAME_STATE === GameState.GAME && event.code === 'Space' && player) {
		const bulletPos = {
			x: player.pos.x + 4 / 3 * player.radius * Math.cos(player.direction),
			y: player.pos.y - 4 / 3 * player.radius * Math.sin(player.direction)
		}
		bullets.push(new Bullet(ctx, bulletPos, player.direction, level, COLORS.BULLET))
	}
	
	if (GAME_STATE === GameState.START && event.code === 'Space') {
		setGameState(GameState.GAME);
	}
	
	if (GAME_STATE === GameState.GAME) {
		console.log('e', event.code);
		if (event.code === 'KeyA') {
			KEYS.LEFT = true;
		} else if (event.code === 'KeyD') {
			KEYS.RIGHT = true;
		} else if (event.code === 'KeyW') {
			KEYS.UP = true;
		}
	}
}

function handleKeyup(event: KeyboardEvent) {
	if (GAME_STATE === GameState.GAME) {
		if (event.code === 'KeyA') {
			KEYS.LEFT = false;
		} else if (event.code === 'KeyD') {
			KEYS.RIGHT = false;
		} else if (event.code === 'KeyW') {
			KEYS.UP = false;
		}
	}
}

function setGameState(newState: GameState) {
	GAME_STATE = newState;
	START_SCREEN.style.display = newState === GameState.START ? 'flex' : 'none';
	INFOS_SCREEN.style.display = newState === GameState.GAME ? 'flex' : 'none';
	canvas.style.display = newState === GameState.GAME ? 'block' : 'none';
	
	if (newState === GameState.GAME) {
		initGame();
		requestAnimationFrame(gameloop);
	}
}

function init() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	setGameState(GameState.START);
	window.addEventListener('keydown', handleKeydown)
	window.addEventListener('keyup', handleKeyup)
}

function initGame() {
	player = new Player(canvas, ctx, { x: canvas.width / 2, y: canvas.height / 2 }, COLORS.WHITE);
	infos = new Infos();
	
	currentLevel = LEVELS[level - 1];
	for (let i = 0; i < currentLevel.numberOfRoids; i++) {
		roids.push(new Roid(canvas, ctx, null, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, null));
	}
}

function gameloop(time: number) {
	ctx.fillStyle = COLORS.BG;
	ctx.fillRect(0,0,canvas.width, canvas.height);
	
	const elapsedTimeBetweenFrames = time - prevTime;
	prevTime = time;
	accumulatedFrameTime += elapsedTimeBetweenFrames;
	while (accumulatedFrameTime >= FRAME_DURATION) {
		// HERE UPDATE GAME ELEMENTS
		// update(frameDuration);
		player.update(KEYS)
		updateBullets();
		checkBulletsRoidsCollisions();
		for (let roid of roids) {
			roid.update();
		}
		accumulatedFrameTime -= FRAME_DURATION;
	}
	// HERE RENDER GAME ELEMENTS
	//render();
	
	if (GAME_STATE === GameState.START) {
		//renderStartScreen(ctx);
		console.log('start');
	} else if (GAME_STATE === GameState.GAME) {
		renderGame();
	} else if (GAME_STATE === GameState.END) {
		console.log('end');
	}
	
	requestAnimationFrame(gameloop);
}

function renderGame() {
	infos.update(level, lives, score);
	player.draw();
	for (let bullet of bullets) {
		bullet.draw();
	}
	for (let roid of roids) {
		roid.draw();
	}
}

/**
 * Update bullet array
 *  - if bullet is out of bounds, remove bullet
 *  - if bullet still visible update the position
 */
function updateBullets() {
	if (bullets.length) {
		for (let i = bullets.length; i > 0; i--) {
			const bullet = bullets[i-1];
			if (bullet.pos.x > canvas.width || bullet.pos.x < 0
				|| bullet.pos.y > canvas.height || bullet.pos.y < 0) {
				bullets.splice(i - 1, 1);
			} else {
				bullet.update();
			}
		}
	}
}

/**
 * Check if any roid was hit by a bullet
 */
function checkBulletsRoidsCollisions(): void {
	for (let i = bullets.length; i > 0; i--) {
		for (let j = roids.length; j > 0; j--) {
			if (isBulletCollidingWithRoid(bullets[i -1], roids[j - 1])) {
				const roid = roids[j - 1];
				bullets.splice(i - 1, 1);
				if (roid.grade > 1) {
					roids.push(new Roid(
						canvas,
						ctx,
						roid.grade - 1,
						currentLevel.maxRoidGrade,
						currentLevel.maxRoidSpeed,
						COLORS.ROIDS,
						{x: roid.pos.x + 1, y: roid.pos.y + 1}
					));
					roids.push(new Roid(
						canvas,
						ctx,
						roid.grade - 1,
						currentLevel.maxRoidGrade,
						currentLevel.maxRoidSpeed,
						COLORS.ROIDS,
						{x: roid.pos.x - 1, y: roid.pos.y - 1}
					));
				}
				roids.splice(j - 1, 1);
				score += roid.points;
				
				return checkBulletsRoidsCollisions();
			}
		}
	}
}

init();
