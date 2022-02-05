var GameState;
(function (GameState) {
    GameState["START"] = "START";
    GameState["GAME"] = "GAME";
    GameState["GAME_OVER"] = "GAME_OVER";
    GameState["WIN"] = "WIN";
})(GameState || (GameState = {}));

class Player {
    canvas;
    ctx;
    size;
    radius;
    pos;
    vel;
    colors;
    direction;
    rotationSpeed;
    isThrusting;
    thrustSpeed;
    friction;
    invincible;
    invincibleStart;
    invincibilityTime;
    opacity;
    blinkTime;
    startInvincibility() {
        this.invincible = true;
        this.invincibleStart = Date.now();
    }
    get isInvencible() {
        return this.invincible;
    }
    constructor(canvas, ctx, initialPosition, color) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.size = 30;
        this.radius = this.size / 2;
        this.direction = 90 / 180 * Math.PI;
        this.pos = {
            x: initialPosition.x,
            y: initialPosition.y
        };
        this.vel = {
            x: 0,
            y: 0,
        };
        this.colors = {
            ship: color,
            thrusterInner: 'hsl(0, 74%, 50%)',
            thrusterOuter: 'hsl(41, 91%, 65%)'
        };
        this.rotationSpeed = Math.PI / 50;
        this.isThrusting = false;
        this.thrustSpeed = .1;
        this.friction = this.thrustSpeed / 12;
        this.invincible = true;
        this.invincibleStart = Date.now();
        this.invincibilityTime = 3000;
        this.opacity = 1;
        this.blinkTime = 500;
    }
    draw() {
        if (this.isThrusting) {
            this.drawThruster();
        }
        this.drawShip();
        if (this.invincible) {
            const delta = Date.now() - this.invincibleStart;
            this.opacity = delta % this.blinkTime < (this.blinkTime / 2) ? 0.25 : 0.75;
        }
    }
    drawShip() {
        this.ctx.beginPath();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.moveTo(// nose of the ship
        this.pos.x + 4 / 3 * this.radius * Math.cos(this.direction), this.pos.y - 4 / 3 * this.radius * Math.sin(this.direction));
        this.ctx.lineTo(// rear left
        this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) + Math.sin(this.direction)), this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) - Math.cos(this.direction)));
        this.ctx.lineTo(// rear right
        this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) - Math.sin(this.direction)), this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) + Math.cos(this.direction)));
        this.ctx.closePath();
        this.ctx.fillStyle = this.colors.ship;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    drawThruster() {
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.colors.thrusterInner;
        this.ctx.strokeStyle = this.colors.thrusterOuter;
        this.ctx.lineWidth = this.size / 15;
        this.ctx.beginPath();
        this.ctx.moveTo(// rear left
        this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) + 0.5 * Math.sin(this.direction)), this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) - 0.5 * Math.cos(this.direction)));
        this.ctx.lineTo(// rear centre (behind the ship)
        this.pos.x - this.radius * 5 / 3 * Math.cos(this.direction), this.pos.y + this.radius * 5 / 3 * Math.sin(this.direction));
        this.ctx.lineTo(// rear right
        this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) - 0.5 * Math.sin(this.direction)), this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) + 0.5 * Math.cos(this.direction)));
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }
    update(KEYS) {
        if (KEYS.RIGHT) {
            this.direction -= this.rotationSpeed;
        }
        if (KEYS.LEFT) {
            this.direction += this.rotationSpeed;
        }
        this.isThrusting = KEYS.UP;
        // Thrust or friction
        if (this.isThrusting) {
            this.vel.x += this.thrustSpeed * Math.cos(this.direction);
            this.vel.y -= this.thrustSpeed * Math.sin(this.direction);
        }
        else {
            if (this.vel.x > 0) {
                this.vel.x -= this.friction;
            }
            else if (this.vel.x < 0) {
                this.vel.x += this.friction;
            }
            if (this.vel.y > 0) {
                this.vel.y -= this.friction;
            }
            else if (this.vel.y < 0) {
                this.vel.y += this.friction;
            }
        }
        // update position
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        if (this.pos.x < 0) {
            this.pos.x = this.canvas.width;
        }
        else if (this.pos.x > this.canvas.width) {
            this.pos.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = this.canvas.height;
        }
        else if (this.pos.y > this.canvas.height) {
            this.pos.y = 0;
        }
        const timeNow = Date.now();
        if (timeNow - this.invincibleStart > this.invincibilityTime) {
            this.invincible = false;
            this.opacity = 1;
        }
    }
}

function utils(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName);
}
// min and max included
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Bullet {
    ctx;
    pos;
    direction;
    grade;
    color;
    size;
    vel;
    constructor(ctx, pos, direction, grade, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.direction = direction;
        this.grade = grade;
        this.color = color;
        this.size = 3;
        this.vel = {
            x: 5,
            y: 5,
        };
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
    update() {
        this.pos.x += this.vel.x * Math.cos(this.direction);
        this.pos.y -= this.vel.y * Math.sin(this.direction);
    }
}

class Infos {
    levelEl;
    livesEl;
    scoreEl;
    levelsAmount;
    constructor(levelsAmount) {
        this.levelEl = document.querySelector('.infos_level');
        this.livesEl = document.querySelector('.infos_lives');
        this.scoreEl = document.querySelector('.infos_score');
        this.levelsAmount = levelsAmount;
    }
    update(level, lives, score) {
        this.levelEl.textContent = `Level:${level}/${this.levelsAmount}`;
        this.livesEl.textContent = `Lives:${lives}`;
        this.scoreEl.textContent = `Score:${score}`;
    }
}

class Roid {
    canvas;
    ctx;
    pos;
    grade;
    size;
    direction;
    vel;
    speed;
    color;
    points;
    sizes = [20, 30, 40, 50, 60];
    possiblePoints = [400, 300, 200, 100, 50];
    constructor(canvas, ctx, grade, maxRoidGrade, maxRoidSpeed, possibleColors, startPos) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.pos = startPos
            ? startPos
            : {
                x: Math.floor(Math.random() * this.canvas.width),
                y: Math.floor(Math.random() * this.canvas.height),
            };
        this.grade = grade ? grade : randomIntFromInterval(1, maxRoidGrade);
        this.size = this.sizes[this.grade - 1];
        this.direction = Math.random() * Math.PI * 2;
        this.speed = randomIntFromInterval(1.5, maxRoidSpeed);
        this.vel = {
            x: Math.random() * this.speed * (Math.random() < 0.5 ? 1 : -1),
            y: Math.random() * this.speed * (Math.random() < 0.5 ? 1 : -1),
        };
        this.color = possibleColors[this.grade - 1];
        this.points = this.possiblePoints[this.grade - 1];
    }
    update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        if (this.pos.x < 0) {
            this.pos.x = this.canvas.width;
        }
        else if (this.pos.x > this.canvas.width) {
            this.pos.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = this.canvas.height;
        }
        else if (this.pos.y > this.canvas.height) {
            this.pos.y = 0;
        }
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}

const LEVELS = [
    {
        level: 1,
        numberOfRoids: 1,
        maxRoidGrade: 1,
        maxRoidSpeed: 2
    }
    // {
    // 	level: 1,
    // 	numberOfRoids: 4,
    // 	maxRoidGrade: 3,
    // 	maxRoidSpeed: 2
    // },
    // {
    // 	level: 2,
    // 	numberOfRoids: 4,
    // 	maxRoidGrade: 3,
    // 	maxRoidSpeed: 3
    // },
    // {
    // 	level: 3,
    // 	numberOfRoids: 5,
    // 	maxRoidGrade: 4,
    // 	maxRoidSpeed: 3.5
    // },
    // {
    // 	level: 4,
    // 	numberOfRoids: 5,
    // 	maxRoidGrade: 4,
    // 	maxRoidSpeed: 4
    // },
    // {
    // 	level: 5,
    // 	numberOfRoids: 6,
    // 	maxRoidGrade: 4,
    // 	maxRoidSpeed: 4
    // },
    // {
    // 	level: 6,
    // 	numberOfRoids: 6,
    // 	maxRoidGrade: 4,
    // 	maxRoidSpeed: 4
    // },
    // {
    // 	level: 7,
    // 	numberOfRoids: 7,
    // 	maxRoidGrade: 4,
    // 	maxRoidSpeed: 4
    // },
    // {
    // 	level: 8,
    // 	numberOfRoids: 8,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 4
    // },
    // {
    // 	level: 9,
    // 	numberOfRoids: 9,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // },
    // {
    // 	level: 10,
    // 	numberOfRoids: 10,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // },
    // {
    // 	level: 11,
    // 	numberOfRoids: 11,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // },
    // {
    // 	level: 12,
    // 	numberOfRoids: 12,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // },
    // {
    // 	level: 13,
    // 	numberOfRoids: 14,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // },
    // {
    // 	level: 14,
    // 	numberOfRoids: 17,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // },
    // {
    // 	level: 15,
    // 	numberOfRoids: 20,
    // 	maxRoidGrade: 5,
    // 	maxRoidSpeed: 5
    // }
];

function areTwoElementsColliding(elOne, elTwo) {
    const sideA = elOne.pos.x - elTwo.pos.x;
    const sideB = elOne.pos.y - elTwo.pos.y;
    const distance = Math.sqrt(sideA * sideA + sideB * sideB);
    return distance <= (elOne.size + elTwo.size);
}

class HitPoint {
    ctx;
    pos;
    points;
    ANIMATION_DURATION;
    startTime;
    opacity;
    color;
    constructor(ctx, pos, points, color) {
        this.ctx = ctx;
        this.pos = pos;
        this.points = points;
        this.ANIMATION_DURATION = 3000;
        this.startTime = Date.now();
        this.opacity = 1;
        this.color = color;
    }
    update() {
        this.pos.y -= 1.5;
        this.opacity -= .025;
        if (this.opacity <= 0.1) {
            this.opacity = 0;
        }
    }
    draw() {
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.color;
        this.ctx.font = '20px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.points}`, this.pos.x, this.pos.y);
        this.ctx.globalAlpha = 1;
    }
}

class PowerUp {
    canvas;
    ctx;
    pos;
    size;
    direction;
    vel;
    speed;
    color;
    sidesCount;
    rotation;
    rotationSpeed;
    radians;
    type;
    bonusPoints;
    possibleTypes = ['bonus', 'bonus', 'bonus', 'bonus', 'live'];
    constructor(canvas, ctx, color) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.pos = {
            x: Math.floor(Math.random() * this.canvas.width),
            y: Math.floor(Math.random() * this.canvas.height),
        };
        this.size = 26;
        this.direction = Math.random() * Math.PI * 2;
        this.speed = 1;
        this.vel = {
            x: Math.random() * this.speed * (Math.random() < 0.5 ? 1 : -1),
            y: Math.random() * this.speed * (Math.random() < 0.5 ? 1 : -1),
        };
        this.color = color;
        this.sidesCount = 5;
        this.rotation = 0;
        this.rotationSpeed = Math.PI / 180;
        this.radians = this.rotation * Math.PI / 180;
        this.type = this.possibleTypes[Math.floor(Math.random() * this.possibleTypes.length)];
        this.bonusPoints = this.type === 'bonus' ? '1000' : '+1up';
    }
    update() {
        this.radians += this.rotationSpeed;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        if (this.pos.x < 0) {
            this.pos.x = this.canvas.width;
        }
        else if (this.pos.x > this.canvas.width) {
            this.pos.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = this.canvas.height;
        }
        else if (this.pos.y > this.canvas.height) {
            this.pos.y = 0;
        }
    }
    draw() {
        this.ctx.translate(this.pos.x, this.pos.y);
        this.ctx.rotate(this.radians);
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.size / 2 * Math.cos(0), this.size / 2 * Math.sin(0));
        for (let i = 0; i < this.sidesCount; i++) {
            this.ctx.lineTo(this.size / 2 * Math.cos(i * 2 * Math.PI / this.sidesCount), this.size / 2 * Math.sin(i * 2 * Math.PI / this.sidesCount));
        }
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.rotate(-this.radians);
        this.ctx.translate(-this.pos.x, -this.pos.y);
    }
}

function saveScore(storeName, score) {
    localStorage.setItem(storeName, JSON.stringify(score));
}
function getScore(storeName) {
    const score = localStorage.getItem(storeName);
    return score ? JSON.parse(score) : [null, null, null];
}

// Get page elements
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const START_SCREEN = document.querySelector('.start');
const INFOS_SCREEN = document.querySelector('.infos');
const END_SCREEN = document.querySelector('.end');
const END_SCREEN_TITLE = END_SCREEN.querySelector('.end__title');
const LEVEL_START_SCREEN = document.querySelector('.level-start');
const LEVEL_START_TITLE = LEVEL_START_SCREEN.querySelector('.level-start__title');
const HISCORE_EL_ONE = document.querySelector('.hiscore--one');
const HISCORE_EL_TWO = document.querySelector('.hiscore--two');
const HISCORE_EL_THREE = document.querySelector('.hiscore--three');
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
    ROIDS: [
        'hsl(53, 100%, 73%)',
        'hsl(45, 100%, 51%)',
        'hsl(14, 100%, 56%)',
        'hsl(1, 77%, 55%)',
        'hsl(0, 73%, 41%)',
    ]
};
// Gameplay variables
const KEYS = {
    LEFT: false,
    RIGHT: false,
    UP: false,
    SPACE: false,
};
// Game variables
const LEVEL_START_SCREEN_DURATION = 3000;
const STARTING_LIVES = 1;
const STARTING_LEVEL = 1;
const STARTING_SCORE = 0;
let GAME_STATE = GameState.START;
const ADD_POWERUP_THRESHOLD = 0.1;
const STORE_NAME = 'AsteroidsScore';
const AMOUNT_OF_HIGHSCORES = 3;
let player;
let infos;
let bullets = [];
let roids = [];
let hitPoints = [];
let currentLevel;
let powerUp = null;
let level = 1;
let score = 0;
let lives = STARTING_LIVES;
function handleKeydown(event) {
    if (GAME_STATE === GameState.GAME && event.code === 'Space' && player) {
        const bulletPos = {
            x: player.pos.x + 4 / 3 * player.radius * Math.cos(player.direction),
            y: player.pos.y - 4 / 3 * player.radius * Math.sin(player.direction)
        };
        bullets.push(new Bullet(ctx, bulletPos, player.direction, level, COLORS.BULLET));
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
        }
        else if (event.code === 'KeyD') {
            KEYS.RIGHT = true;
        }
        else if (event.code === 'KeyW') {
            KEYS.UP = true;
        }
    }
}
function handleKeyup(event) {
    if (GAME_STATE === GameState.GAME) {
        if (event.code === 'KeyA') {
            KEYS.LEFT = false;
        }
        else if (event.code === 'KeyD') {
            KEYS.RIGHT = false;
        }
        else if (event.code === 'KeyW') {
            KEYS.UP = false;
        }
    }
}
function setGameState(newState) {
    GAME_STATE = newState;
    START_SCREEN.style.display = newState === GameState.START ? 'flex' : 'none';
    INFOS_SCREEN.style.display = newState === GameState.GAME ? 'flex' : 'none';
    END_SCREEN.style.display = newState === GameState.GAME_OVER || newState === GameState.WIN ? 'flex' : 'none';
    canvas.style.display = newState === GameState.GAME ? 'block' : 'none';
    if (GAME_STATE === GameState.GAME) {
        initGame();
    }
    else if (GAME_STATE === GameState.WIN || GAME_STATE === GameState.GAME_OVER) {
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
        player = new Player(canvas, ctx, { x: canvas.width / 2, y: canvas.height / 2 }, COLORS.SHIP);
        currentLevel = LEVELS[level - 1];
        for (let i = 0; i < currentLevel.numberOfRoids; i++) {
            roids.push(new Roid(canvas, ctx, null, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, null));
        }
        requestAnimationFrame(gameloop);
    }, LEVEL_START_SCREEN_DURATION);
}
function gameloop(time) {
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
            const bullet = bullets[i - 1];
            if (bullet.pos.x > canvas.width || bullet.pos.x < 0
                || bullet.pos.y > canvas.height || bullet.pos.y < 0) {
                bullets.splice(i - 1, 1);
            }
            else {
                bullet.update();
            }
        }
    }
}
/**
 * Check if any roid was hit by a bullet
 */
function checkBulletsRoidsCollisions() {
    for (let i = bullets.length; i > 0; i--) {
        for (let j = roids.length; j > 0; j--) {
            if (areTwoElementsColliding(bullets[i - 1], roids[j - 1])) {
                const roid = roids[j - 1];
                bullets.splice(i - 1, 1);
                if (roid.grade > 1) {
                    roids.push(new Roid(canvas, ctx, roid.grade - 1, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, { x: roid.pos.x + 1, y: roid.pos.y + 1 }));
                    roids.push(new Roid(canvas, ctx, roid.grade - 1, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, { x: roid.pos.x - 1, y: roid.pos.y - 1 }));
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
        }
        else {
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
        if (bullets[i - 1] && powerUp && areTwoElementsColliding(bullets[i - 1], powerUp)) {
            bullets.splice(i - 1, 1);
            hitPoints.push(new HitPoint(ctx, powerUp.pos, powerUp.bonusPoints, COLORS.POWER_UP));
            if (powerUp.type === 'bonus') {
                score += +powerUp.bonusPoints;
            }
            else if (powerUp.type === 'live') {
                lives++;
            }
            powerUp = null;
        }
    }
    powerUp && powerUp.update();
}
function checkPlayerRoidsCollisions() {
    if (player.isInvencible)
        return;
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
        }
        else {
            hitPoints.splice(i - 1, 1);
        }
    }
}
function showPlayerHitCanvasBorder() {
    canvas.classList.add('canvas--player-hit');
    canvas.addEventListener('animationend', (event) => {
        if (event.animationName === 'canvasBorderAnimation') {
            canvas.classList.remove('canvas--player-hit');
        }
    });
}
function updateSavedScore() {
    const hiScores = getScore(STORE_NAME);
    if (GAME_STATE === GameState.WIN) {
        for (let i = 0; i < AMOUNT_OF_HIGHSCORES; i++) {
            if (hiScores[i] && hiScores[i].score >= score) {
                continue;
            }
            else {
                let userName = window.prompt('Well done, you have one of the top 3 scores. What is your user name?');
                if (!userName)
                    userName = 'n/a';
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
//# sourceMappingURL=asteroids.js.map
