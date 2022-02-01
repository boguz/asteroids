var GameState;
(function (GameState) {
    GameState["START"] = "START";
    GameState["GAME"] = "GAME";
    GameState["END"] = "END";
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
        this.friction = this.thrustSpeed / 10;
    }
    draw() {
        if (this.isThrusting) {
            this.drawThruster();
        }
        this.drawShip();
        // centre dot (optional)
        // this.ctx.fillStyle = "red";
        //this.ctx.fillRect(this.pos.x - 1, this.pos.y - 1, 4, 4);
    }
    drawShip() {
        this.ctx.beginPath();
        this.ctx.moveTo(// nose of the ship
        this.pos.x + 4 / 3 * this.radius * Math.cos(this.direction), this.pos.y - 4 / 3 * this.radius * Math.sin(this.direction));
        this.ctx.lineTo(// rear left
        this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) + Math.sin(this.direction)), this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) - Math.cos(this.direction)));
        this.ctx.lineTo(// rear right
        this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) - Math.sin(this.direction)), this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) + Math.cos(this.direction)));
        this.ctx.closePath();
        this.ctx.fillStyle = this.colors.ship;
        this.ctx.fill();
    }
    drawThruster() {
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
            if (this.vel.y > 0) {
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
        console.log('aaa', this.direction);
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
    constructor() {
        this.levelEl = document.querySelector('.infos_level');
        this.livesEl = document.querySelector('.infos_lives');
        this.scoreEl = document.querySelector('.infos_score');
    }
    update(level, lives, score) {
        this.levelEl.textContent = `Level:${level}`;
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
        console.log(this);
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
        numberOfRoids: 4,
        maxRoidGrade: 3,
        maxRoidSpeed: 3
    },
    {
        level: 2,
        numberOfRoids: 6,
        maxRoidGrade: 3,
        maxRoidSpeed: 3.5
    },
    {
        level: 3,
        numberOfRoids: 8,
        maxRoidGrade: 4,
        maxRoidSpeed: 4
    }
];

function isBulletCollidingWithRoid(bullet, roid) {
    const sideA = bullet.pos.x - roid.pos.x;
    const sideB = bullet.pos.y - roid.pos.y;
    const distance = Math.sqrt(sideA * sideA + sideB * sideB);
    return distance <= (bullet.size + roid.size);
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
    update(currentTime) {
        const delta = currentTime - this.startTime;
        console.log('delta', delta);
        this.pos.y -= 1.5;
        this.opacity -= .025;
        if (this.opacity <= 0.1) {
            console.log('..............', this.opacity);
            this.opacity = 0;
        }
    }
    draw() {
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.color;
        this.ctx.font = "20px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${this.points}`, this.pos.x, this.pos.y);
        this.ctx.globalAlpha = 1;
    }
}

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const START_SCREEN = document.querySelector('.start');
const INFOS_SCREEN = document.querySelector('.infos');
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
const KEYS = {
    LEFT: false,
    RIGHT: false,
    UP: false,
    SPACE: false,
};
let GAME_STATE = GameState.START;
let player;
let infos;
let bullets = [];
let roids = [];
let hitPoints = [];
let level = 1;
let currentLevel;
let score = 0;
let lives = STARTING_LIVES;
let prevTime = performance.now();
let accumulatedFrameTime = 0;
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
    if (GAME_STATE === GameState.GAME) {
        console.log('e', event.code);
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
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
}
function initGame() {
    player = new Player(canvas, ctx, { x: canvas.width / 2, y: canvas.height / 2 }, COLORS.WHITE);
    infos = new Infos();
    currentLevel = LEVELS[level - 1];
    for (let i = 0; i < currentLevel.numberOfRoids; i++) {
        roids.push(new Roid(canvas, ctx, null, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, null));
    }
}
function gameloop(time) {
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const elapsedTimeBetweenFrames = time - prevTime;
    prevTime = time;
    accumulatedFrameTime += elapsedTimeBetweenFrames;
    while (accumulatedFrameTime >= FRAME_DURATION) {
        // HERE UPDATE GAME ELEMENTS
        // update(frameDuration);
        player.update(KEYS);
        updateBullets();
        checkBulletsRoidsCollisions();
        for (let roid of roids) {
            roid.update();
        }
        updatePoints();
        accumulatedFrameTime -= FRAME_DURATION;
    }
    // HERE RENDER GAME ELEMENTS
    //render();
    if (GAME_STATE === GameState.START) {
        //renderStartScreen(ctx);
        console.log('start');
    }
    else if (GAME_STATE === GameState.GAME) {
        renderGame();
    }
    else if (GAME_STATE === GameState.END) {
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
            if (isBulletCollidingWithRoid(bullets[i - 1], roids[j - 1])) {
                const roid = roids[j - 1];
                bullets.splice(i - 1, 1);
                if (roid.grade > 1) {
                    roids.push(new Roid(canvas, ctx, roid.grade - 1, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, { x: roid.pos.x + 1, y: roid.pos.y + 1 }));
                    roids.push(new Roid(canvas, ctx, roid.grade - 1, currentLevel.maxRoidGrade, currentLevel.maxRoidSpeed, COLORS.ROIDS, { x: roid.pos.x - 1, y: roid.pos.y - 1 }));
                }
                hitPoints.push(new HitPoint(ctx, roid.pos, roid.points, COLORS.WHITE));
                roids.splice(j - 1, 1);
                score += roid.points;
                return checkBulletsRoidsCollisions();
            }
        }
    }
}
function updatePoints() {
    for (let i = hitPoints.length; i > 0; i--) {
        const hitPoint = hitPoints[i - 1];
        if (hitPoint.opacity > 0) {
            hitPoint.update(Date.now());
        }
        else {
            hitPoints.splice(i - 1, 1);
        }
    }
}
init();
//# sourceMappingURL=asteroids.js.map
