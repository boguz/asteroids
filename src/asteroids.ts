import { GameState, KeysInterface, LevelInterface } from './types/types';
import { Player } from './classes/Player.js';
import { utils } from './utils/utils.js';
import { Bullet } from './classes/Bullet.js';
import { Infos } from './classes/Infos.js';
import { Roid } from './classes/Roid.js';
import { LEVELS } from './levels.js';
import { areTwoElementsColliding } from './utils/collisionDetection.js';
import { HitPoint } from './classes/HitPoint.js';
import { PowerUp } from './classes/PowerUp.js';
import { getScore, saveScore } from './utils/localStorage.js';
import { Star } from './classes/Star.js';

// Get page elements
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const START_SCREEN = document.querySelector('.start') as HTMLElement;
const INFOS_SCREEN = document.querySelector('.infos') as HTMLElement;
const END_SCREEN = document.querySelector('.end') as HTMLElement;
const END_SCREEN_TITLE = END_SCREEN.querySelector('.end__title') as HTMLHeadingElement;
const LEVEL_START_SCREEN = document.querySelector('.level-start') as HTMLElement;
const LEVEL_START_TITLE = LEVEL_START_SCREEN.querySelector('.level-start__title') as HTMLHeadingElement;
const HISCORE_EL_ONE = document.querySelector('.hiscore--one') as HTMLParagraphElement;
const HISCORE_EL_TWO = document.querySelector('.hiscore--two') as HTMLParagraphElement;
const HISCORE_EL_THREE = document.querySelector('.hiscore--three') as HTMLParagraphElement;
const HISCORE_ELEMENTS = [HISCORE_EL_ONE, HISCORE_EL_TWO, HISCORE_EL_THREE];

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
	POWER_UP: 'hsl(187, 71%, 50%)',
	STAR: 'hsl(55, 100%, 95%)',
	ROIDS: [
		'hsl(47, 100%, 75%)',
		'hsl(40, 100%, 51%)',
		'hsl(14, 80%, 52%)',
		'hsl(1, 71%, 48%)',
		'hsl(0, 73%, 32%)',
	]
};

// Gameplay variables
const KEYS: KeysInterface = {
	LEFT: false,
	RIGHT: false,
	UP: false,
	SPACE: false,
};

// Game variables
const LEVEL_START_SCREEN_DURATION = 2000;
const STARTING_LIVES = 3;
const STARTING_LEVEL = 1;
const STARTING_SCORE = 0;
const ADD_POWERUP_THRESHOLD = 1;
const STORE_NAME = 'AsteroidsScore';
const AMOUNT_OF_HIGHSCORES = 3;
const BULLETS_MAX = 10;
const NUM_OF_STARS = 20;
let GAME_STATE: GameState = GameState.START;

let player: Player;
let infos: Infos;
let bullets: Bullet[] = [];
let roids: Roid[] = [];
let hitPoints: HitPoint[] = [];
let stars: Star[];
let currentLevel: LevelInterface;
let powerUp: PowerUp | null = null;

let level = 1;
let score = 0;
let lives = STARTING_LIVES;

function handleKeydown(event: KeyboardEvent) {
	if (GAME_STATE === GameState.GAME && event.code === 'Space' && player) {
		const bulletPos = {
			x: player.pos.x + 4 / 3 * player.radius * Math.cos(player.direction),
			y: player.pos.y - 4 / 3 * player.radius * Math.sin(player.direction)
		};
		if (bullets.length < BULLETS_MAX) {
			bullets.push(new Bullet(ctx, bulletPos, player.direction, level, COLORS.BULLET));
		}
	}
	
	if (GAME_STATE === GameState.START && event.code === 'Space') {
		setGameState(GameState.GAME);
	}
	
	if (GAME_STATE === GameState.GAME_OVER && event.code === 'Space' ||
		GAME_STATE === GameState.WIN && event.code === 'Space') {
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
	END_SCREEN.style.display = newState === GameState.GAME_OVER || newState === GameState.WIN ? 'flex' : 'none';
	canvas.style.display = newState === GameState.GAME ? 'block' : 'none';
	
	if (GAME_STATE === GameState.GAME) {
		initGame();
	} else if (GAME_STATE === GameState.WIN || GAME_STATE === GameState.GAME_OVER) {
		END_SCREEN_TITLE.textContent = GAME_STATE === GameState.GAME_OVER ? 'GAME OVER' : 'YOU WIN';
		updateSavedScore();
	}
}

function init() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	setGameState(GameState.START);
	window.addEventListener('keydown', handleKeydown);
	window.addEventListener('keyup', handleKeyup);
}

function initGame() {
	infos = new Infos(LEVELS.length);
	score = STARTING_SCORE;
	lives = STARTING_LIVES;
	level = STARTING_LEVEL;
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
		stars = [];
		player = new Player(canvas, ctx, { x: canvas.width / 2, y: canvas.height / 2 }, COLORS.SHIP);
		
		currentLevel = LEVELS[level - 1];
		for (let i = 0; i < currentLevel.numberOfRoids; i++) {
			roids.push(new Roid(canvas, ctx, null, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, null));
		}
		for (let i = 0; i < NUM_OF_STARS; i++) {
			stars.push(new Star(canvas, ctx, COLORS.STAR));
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
		player.update(KEYS);
		
		updateBullets();
		checkPlayerRoidsCollisions();
		checkBulletsRoidsCollisions();
		for (const roid of roids) {
			roid.update();
		}
		updatePoints();
		powerUp && updatePowerUp();
		powerUp && checkPowerUpFade();
		
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
	for (const bullet of bullets) {
		bullet.draw();
	}
	for (const roid of roids) {
		roid.draw();
	}
	for (const hitPoint of hitPoints) {
		hitPoint.draw();
	}
	for (const star of stars) {
		star.draw();
	}
	powerUp && powerUp.draw();
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
				hitPoints.push(new HitPoint(ctx, roid.pos, roid.points, COLORS.POINTS));
				roids.splice(j - 1, 1);
				score += roid.points;
				
				if (roids.length && !powerUp) {
					addPowerUp();
				}
				
				return checkBulletsRoidsCollisions();
			}
		}
	}
	
	if (lives > 0 && !roids.length) {
		if (level !== LEVELS.length) {
			level++;
			initLevel();
		} else {
			setGameState(GameState.WIN);
		}
	}
}

function addPowerUp() {
	const shouldAddPowerUp = Math.random() < ADD_POWERUP_THRESHOLD;
	if (shouldAddPowerUp) {
		powerUp = new PowerUp(canvas, ctx, COLORS.POWER_UP);
	}
}

function updatePowerUp() {
	for (let i = bullets.length; i > 0; i--) {
		if (bullets[i-1] && powerUp && areTwoElementsColliding(bullets[i -1], powerUp!)) {
			bullets.splice(i - 1, 1);
			hitPoints.push(new HitPoint(ctx, powerUp!.pos, powerUp!.bonusPoints, COLORS.POWER_UP));
			if (powerUp!.type === 'bonus') {
				score += +powerUp!.bonusPoints;
			} else if (powerUp!.type === 'live') {
				lives++;
			}
			powerUp = null;
		}
	}
	
	powerUp && powerUp.update();
}

function checkPowerUpFade() {
	if (powerUp?.opacity === 0) {
		powerUp = null;
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
			hitPoint.update();
		} else {
			hitPoints.splice(i - 1, 1);
		}
	}
}

function showPlayerHitCanvasBorder() {
	canvas.classList.add('canvas--player-hit');
	
	canvas.addEventListener('animationend', (event: AnimationEvent) => {
		if (event.animationName === 'canvasBorderAnimation') {
			canvas.classList.remove('canvas--player-hit');
		}
	});
}

function updateSavedScore() {
	const hiScores = getScore(STORE_NAME);
	if (GAME_STATE === GameState.WIN) {
		for (let i = 0; i < AMOUNT_OF_HIGHSCORES; i++) {
			if (hiScores[i] && hiScores[i]!.score >= score) {
				continue;
			} else {
				let userName = window.prompt('Well done, you have one of the top 3 scores. What is your user name?');
				if (!userName) userName = 'n/a';
				hiScores[i] = { name: userName.trim(), score: score };
				break;
			}
		}
		saveScore(STORE_NAME, hiScores);
	}
	
	for (let i = 0; i < AMOUNT_OF_HIGHSCORES; i++) {
		const hiScoreName = hiScores[i]?.name ? hiScores[i]?.name : '---';
		const hiScoreScore = hiScores[i]?.score ? hiScores[i]?.score : '---';
		HISCORE_ELEMENTS[i].textContent = `${i + 1}. ${hiScoreName}: ${hiScoreScore}`;
	}
}

init();
