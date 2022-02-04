import { KeysInterface, PositionInterface } from "../types/types.js";

export class Player {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	public size: number;
	public radius: number;
	public pos: PositionInterface;
	private vel: { x: number; y: number };
	private colors: { ship: string, thrusterInner: string, thrusterOuter: string }
	public direction: number;
	private rotationSpeed: number;
	private isThrusting: boolean;
	private thrustSpeed: number;
	private friction: number;
	private invincible: boolean;
	private invincibleStart: number;
	private invincibilityTime: number;
	private opacity: number;
	private blinkTime: number;
	
	public startInvincibility() {
		this.invincible = true;
		this.invincibleStart = Date.now();
	}
	
	get isInvencible() {
		return this.invincible;
	}
	
	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, initialPosition: PositionInterface, color: string) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.size = 30;
		this.radius = this.size / 2;
		this.direction = 90 / 180 * Math.PI;
		this.pos = {
			x: initialPosition.x,
			y: initialPosition.y
		}
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
		this.ctx.moveTo( // nose of the ship
			this.pos.x + 4 / 3 * this.radius * Math.cos(this.direction),
			this.pos.y - 4 / 3 * this.radius * Math.sin(this.direction)
		);
		this.ctx.lineTo( // rear left
			this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) + Math.sin(this.direction)),
			this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) - Math.cos(this.direction))
		);
		this.ctx.lineTo( // rear right
			this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) - Math.sin(this.direction)),
			this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) + Math.cos(this.direction))
		);
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
		this.ctx.moveTo( // rear left
			this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) + 0.5 * Math.sin(this.direction)),
			this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) - 0.5 * Math.cos(this.direction))
		);
		this.ctx.lineTo( // rear centre (behind the ship)
			this.pos.x - this.radius * 5 / 3 * Math.cos(this.direction),
			this.pos.y + this.radius * 5 / 3 * Math.sin(this.direction)
		);
		this.ctx.lineTo( // rear right
			this.pos.x - this.radius * (2 / 3 * Math.cos(this.direction) - 0.5 * Math.sin(this.direction)),
			this.pos.y + this.radius * (2 / 3 * Math.sin(this.direction) + 0.5 * Math.cos(this.direction))
		);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.globalAlpha = 1;
	}
	
	update(KEYS: KeysInterface) {
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
		} else {
			if (this.vel.x > 0) {
				this.vel.x -= this.friction;
			} else if (this.vel.x < 0) {
				this.vel.x += this.friction;
			}
			if (this.vel.y > 0) {
				this.vel.y -= this.friction;
			} else if (this.vel.y < 0) {
				this.vel.y += this.friction;
			}
		}
		
		// update position
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		
		if (this.pos.x < 0) {
			this.pos.x = this.canvas.width;
		} else if (this.pos.x > this.canvas.width) {
			this.pos.x = 0;
		}
		
		if (this.pos.y < 0) {
			this.pos.y = this.canvas.height;
		} else if (this.pos.y > this.canvas.height) {
			this.pos.y = 0;
		}
		
		const timeNow = Date.now();
		if (timeNow - this.invincibleStart > this.invincibilityTime) {
			this.invincible = false;
			this.opacity = 1;
		}
	}
}
