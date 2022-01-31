import { GameState, KeysInterface } from "./types/types";
import { Player } from "./classes/Player.js";
import { getCSSVariable } from "./utils/getCSSVariable";
import { Bullet } from "./classes/Bullet.js";

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const START_SCREEN = document.querySelector('.start') as HTMLElement;

const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
const COLORS = {
	BG: getCSSVariable('--color-bg'),
	WHITE: getCSSVariable('--color-white'),
	BULLET: 'hsl(337, 100%, 65%)'
};
const KEYS: KeysInterface = {
	LEFT: false,
	RIGHT: false,
	UP: false,
	SPACE: false,
}
let GAME_STATE: GameState = GameState.START;
let player: Player;

let bullets: Bullet[] = [];
let level = 1;

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
	player.draw();
	for (let bullet of bullets) {
		bullet.draw();
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
				bullets.splice(i-1, 1);
			} else {
				bullet.update();
			}
		}
	}
}

init();
