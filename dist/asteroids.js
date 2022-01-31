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

function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName);
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

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const START_SCREEN = document.querySelector('.start');
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
const COLORS = {
    BG: getCSSVariable('--color-bg'),
    WHITE: getCSSVariable('--color-white'),
    BULLET: 'hsl(337, 100%, 65%)'
};
const KEYS = {
    LEFT: false,
    RIGHT: false,
    UP: false,
    SPACE: false,
};
let GAME_STATE = GameState.START;
let player;
let bullets = [];
let level = 1;
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
init();
//# sourceMappingURL=asteroids.js.map
