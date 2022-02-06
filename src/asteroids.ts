import { GameState, KeysInterface, LevelInterface } from './types/types';
import { Player } from './classes/Player.js';
import { getCSSVariableValue } from './utils/utils.js';
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

// Mediaqueries
const MIN_WIDTH = 1200;
const MATCH_MEDIA = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
let isDesktop = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`).matches;
MATCH_MEDIA.addListener(event => {
	isDesktop = event.matches;
	if (isDesktop && GAME_STATE === GameState.START) {
		init();
	} else if (!isDesktop) {
		setGameState(GameState.START);
	}
});

// Game animation variables
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
let prevTime = performance.now();
let accumulatedFrameTime = 0;

// Colors and design
const COLORS = {
	BG: getCSSVariableValue('--color-bg'),
	WHITE: getCSSVariableValue('--color-white'),
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
let KEYS: KeysInterface = {
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
const ADD_POWERUP_PROBABILITY = 0.05;
const STORE_NAME = 'AsteroidsScore';
const AMOUNT_OF_HIGHSCORES = 3;
const BULLETS_MAX = 8;
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

// Initial  game values
let level = 1;
let score = 0;
let lives = STARTING_LIVES;

/**
 * Handle key down events correctly according to game state
 *
 * @param event
 */
function handleKeydown(event: KeyboardEvent) {
	// Shoot
	if (GAME_STATE === GameState.GAME && event.code === 'Space' && player) {
		const bulletPos = {
			x: player.pos.x + 4 / 3 * player.radius * Math.cos(player.direction),
			y: player.pos.y - 4 / 3 * player.radius * Math.sin(player.direction)
		};
		if (bullets.length < BULLETS_MAX) {
			bullets.push(new Bullet(ctx, bulletPos, player.direction, level, COLORS.BULLET));
		}
	}
	
	// Start game from Start Screen
	if (GAME_STATE === GameState.START && event.code === 'Space') {
		setGameState(GameState.GAME);
	}
	
	// Restart game from End or Win screens
	if (GAME_STATE === GameState.GAME_OVER && event.code === 'Space' ||
		GAME_STATE === GameState.WIN && event.code === 'Space') {
		setGameState(GameState.GAME);
		initGame();
	}
	
	// Set correct pressed key values
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

/**
 * Set key pressed values to false on key up event
 *
 * @param event
 */
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

/**
 * Change game state
 *  - set correct GAME_STATE
 *  - show / hide correct screen for current state
 *  - handle new game and win / game over states
 *
 * @param newState
 */
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

/**
 * Initialize app
 */
function init() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	setGameState(GameState.START);
	window.addEventListener('keydown', handleKeydown);
	window.addEventListener('keyup', handleKeyup);
}

/**
 * Initialize game
 */
function initGame() {
	infos = new Infos(LEVELS.length);
	score = STARTING_SCORE;
	lives = STARTING_LIVES;
	level = STARTING_LEVEL;
	initLevel();
}

/**
 * Initialize level
 *  - show correct info on level start screen
 *  - pause for level screen
 *  - reset game elements
 *  - start game animation
 */
function initLevel() {
	LEVEL_START_TITLE.textContent = `LEVEL ${level}`;
	LEVEL_START_SCREEN.style.display = 'flex';
	KEYS = {
		LEFT: false,
		RIGHT: false,
		UP: false,
		SPACE: false,
	};
	
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

/**
 * Game loop
 *  - clear canvas
 *  - update game elements
 *  - render game elements
 * @param time
 */
function gameloop(time: number) {
	ctx.fillStyle = COLORS.BG;
	ctx.fillRect(0,0,canvas.width, canvas.height);
	
	const elapsedTimeBetweenFrames = time - prevTime;
	prevTime = time;
	accumulatedFrameTime += elapsedTimeBetweenFrames;
	while (accumulatedFrameTime >= FRAME_DURATION) {
		// UPDATE GAME ELEMENTS
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
	
	// RENDER GAME ELEMENTS
	if (GAME_STATE === GameState.GAME && roids.length) {
		renderGame();
		requestAnimationFrame(gameloop);
	}
}

/**
 * Render all game elements
 */
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
 *  if so:
 *      - remove roid
 *      - remove bullet
 *      - add new roids (if needed)
 *      - show points
 *      - add points to score
 *      - add Power Up
 *      - Check new level / win screen
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

/**
 * Add power up
 */
function addPowerUp() {
	if (Math.random() < ADD_POWERUP_PROBABILITY) {
		powerUp = new PowerUp(canvas, ctx, COLORS.POWER_UP);
	}
}

/**
 * Update power up
 *  - Check if hit by bullet
 *      - remove power up
 *      - remove bullet
 *      - add power up points / live
 *  - update power up position
 */
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

/**
 * Check if power up has faded
 *  - remove power up
 */
function checkPowerUpFade() {
	if (powerUp?.opacity === 0) {
		powerUp = null;
	}
}

/**
 * Check collision between player and roids
 *  - remove live
 *  - set game over (if no more lives)
 */
function checkPlayerRoidsCollisions() {
	if (player.isInvincible) return;
	
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

/**
 * Update points
 *  - update position
 *  - remove points that have faded out
 */
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

/**
 * Show canvas border when player is hit
 */
function showPlayerHitCanvasBorder() {
	canvas.classList.add('canvas--player-hit');
	
	canvas.addEventListener('animationend', (event: AnimationEvent) => {
		if (event.animationName === 'canvasBorderAnimation') {
			canvas.classList.remove('canvas--player-hit');
		}
	});
}

/**
 * Update hi-scores
 *  - If score is hi-score, prompt name and save to local storage
 *  - Show hi-scores
 */
function updateSavedScore() {
	const hiScores = getScore(STORE_NAME);
	if (GAME_STATE === GameState.WIN || GAME_STATE === GameState.GAME_OVER) {
		for (let i = 0; i < AMOUNT_OF_HIGHSCORES; i++) {
			if (hiScores[i] && hiScores[i]!.score >= score) {
				continue;
			} else {
				let userName = window.prompt('Well done, you have one of the top 3 scores. What is your user name?');
				if (!userName) userName = 'n/a';
				//hiScores[i] = { name: userName.trim(), score: score };
				hiScores.splice(i, 0, { name: userName.trim(), score: score });
				break;
			}
		}
		hiScores.length = AMOUNT_OF_HIGHSCORES;
		saveScore(STORE_NAME, hiScores);
	}
	
	for (let i = 0; i < AMOUNT_OF_HIGHSCORES; i++) {
		const hiScoreName = hiScores[i]?.name ? hiScores[i]?.name : '---';
		const hiScoreScore = hiScores[i]?.score ? hiScores[i]?.score : '---';
		HISCORE_ELEMENTS[i].textContent = `${i + 1}. ${hiScoreName}: ${hiScoreScore}`;
	}
}

// Init app if desktop device
if (isDesktop) {
	init();
}

