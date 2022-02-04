import { GameState, KeysInterface, LevelInterface } from "./types/types";
import { Player } from "./classes/Player.js";
import { utils } from "./utils/utils.js";
import { Bullet } from "./classes/Bullet.js";
import { Infos } from "./classes/Infos.js";
import { Roid } from "./classes/Roid.js";
import { LEVELS } from "./levels.js";
import { areTwoElementsColliding } from "./utils/collisionDetection.js";
import { HitPoint } from "./classes/HitPoint";

// Get page elements
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const START_SCREEN = document.querySelector('.start') as HTMLElement;
const INFOS_SCREEN = document.querySelector('.infos') as HTMLElement;
const END_SCREEN = document.querySelector('.end') as HTMLElement;
const LEVEL_START_SCREEN = document.querySelector('.level-start') as HTMLElement;
const LEVEL_START_TITLE = LEVEL_START_SCREEN.querySelector('.level-start__title') as HTMLHeadingElement;


// Game animation variables
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
let prevTime = performance.now();
let accumulatedFrameTime = 0;

// Colors and design
const COLORS = {
	BG: utils('--color-bg'),
	WHITE: utils('--color-white'),
	SHIP: 'hsl(20, 16%, 93%)',
	BULLET: 'hsl(291, 80%, 50%)',
	POINTS: 'hsl(291, 60%, 75%)',
	ROIDS: [
		'hsl(53, 100%, 73%)',
		'hsl(45, 100%, 51%)',
		'hsl(14, 100%, 56%)',
		'hsl(1, 77%, 55%)',
		'hsl(0, 73%, 41%)',
	]
};

// Gameplay variables
const KEYS: KeysInterface = {
	LEFT: false,
	RIGHT: false,
	UP: false,
	SPACE: false,
}

// Game variables
const LEVEL_START_SCREEN_DURATION = 3000;
const STARTING_LIVES = 3;
let STARTING_LEVEL = 1;
let GAME_STATE: GameState = GameState.START;
let STARTING_SCORE = 0;

let player: Player;
let infos: Infos;
let bullets: Bullet[] = [];
let roids: Roid[] = [];
let hitPoints: HitPoint[] = [];
let currentLevel: LevelInterface;

let level = 1;
let score = 0;
let lives = STARTING_LIVES;

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
	
	if (GAME_STATE === GameState.GAME_OVER && event.code === 'Space') {
		setGameState(GameState.GAME);
		initGame();
	}
	
	if (GAME_STATE === GameState.GAME) {
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
	END_SCREEN.style.display = newState === GameState.GAME_OVER ? 'flex' : 'none';
	canvas.style.display = newState === GameState.GAME ? 'block' : 'none';
	
	if (newState === GameState.GAME) {
		initGame();
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
	infos = new Infos();
	score = STARTING_SCORE;
	lives = STARTING_LIVES;
	level = STARTING_LEVEL
	initLevel();
}

function initLevel() {
	LEVEL_START_TITLE.textContent = `LEVEL ${level}`;
	LEVEL_START_SCREEN.style.display = 'flex';
	
	setTimeout(() => {
		LEVEL_START_SCREEN.style.display = 'none';
		roids = [];
		bullets = [];
		hitPoints = [];
		player = new Player(canvas, ctx, { x: canvas.width / 2, y: canvas.height / 2 }, COLORS.SHIP);
		
		currentLevel = LEVELS[level - 1];
		for (let i = 0; i < currentLevel.numberOfRoids; i++) {
			roids.push(new Roid(canvas, ctx, null, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, null));
		}
		requestAnimationFrame(gameloop);
		
	}, LEVEL_START_SCREEN_DURATION);
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
		player.update(KEYS);
		
		updateBullets();
		checkPlayerRoidsCollisions();
		checkBulletsRoidsCollisions();
		for (let roid of roids) {
			roid.update();
		}
		updatePoints()
		accumulatedFrameTime -= FRAME_DURATION;
	}
	
	// HERE RENDER GAME ELEMENTS
	if (GAME_STATE === GameState.GAME && roids.length) {
		renderGame();
		requestAnimationFrame(gameloop);
	}
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
	for (let hitPoint of hitPoints) {
		hitPoint.draw();
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
			if (areTwoElementsColliding(bullets[i -1], roids[j - 1])) {
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
				hitPoints.push(new HitPoint(ctx, roid.pos, roid.points, COLORS.POINTS))
				roids.splice(j - 1, 1);
				score += roid.points;
				
				return checkBulletsRoidsCollisions();
			}
		}
	}
	
	if (lives > 0 && !roids.length) {
		level++;
		initLevel();
	}
}

function checkPlayerRoidsCollisions() {
	if (player.isInvencible) return;
	
	for (let i = roids.length; i > 0; i--) {
		if (areTwoElementsColliding(player, roids[i - 1])) {
			showPlayerHitCanvasBorder();
			player.startInvincibility();
			lives--;
		}
	}
	
	if (lives === 0) {
		setGameState(GameState.GAME_OVER);
	}
	
}

function updatePoints() {
	for (let i = hitPoints.length; i > 0; i--) {
		const hitPoint = hitPoints[i - 1];
		if (hitPoint.opacity > 0) {
			hitPoint.update(Date.now());
		} else {
			hitPoints.splice(i - 1, 1);
		}
	}
}

function showPlayerHitCanvasBorder() {
	canvas.classList.add('canvas--player-hit');
	
	canvas.addEventListener('animationend', (event: AnimationEvent) => {
		if (event.animationName === 'canvasBorderAnimation') {
			canvas.classList.remove('canvas--player-hit')
		}
	});
}

init();
