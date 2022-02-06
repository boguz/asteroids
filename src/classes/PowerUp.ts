import { PositionInterface } from '../types/types.js';

export class PowerUp {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	public pos: PositionInterface;
	public size: number;
	private direction: number;
	private vel: { x: number, y: number };
	private speed: number;
	private color: string;
	private sidesCount: number;
	private rotation: number;
	private rotationSpeed: number;
	private radians: number;
	public type: string;
	public bonusPoints: string;
	private creationTime: number;
	private duration: number;
	public opacity: number;
	private fadeSpeed: number;
	
	private possibleTypes = ['bonus', 'bonus', 'bonus', 'bonus', 'bonus', 'bonus', 'bonus', 'bonus', 'bonus', 'live'];
	
	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		color: string,
	)
	{
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
		this.creationTime = Date.now();
		this.duration = 5000;
		this.opacity = 1;
		this.fadeSpeed = 0.01;
	}
	
	update() {
		if (Date.now() - this.creationTime > this.duration && this.opacity > 0) {
			this.opacity -= this.fadeSpeed;
			
			if (this.opacity <= 0.05) {
				this.opacity = 0;
			}
		}
		
		
		this.radians += this.rotationSpeed;
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
	}
	
	draw() {
		this.ctx.globalAlpha = this.opacity;
		this.ctx.translate(this.pos.x, this.pos.y);
		this.ctx.rotate(this.radians);
		this.ctx.fillStyle = this.color;
		this.ctx.beginPath();
		this.ctx.moveTo(
			this.size / 2 * Math.cos(0),
			this.size / 2 * Math.sin(0)
		);
		for (let i = 0; i < this.sidesCount; i ++) {
			this.ctx.lineTo(
				this.size / 2 * Math.cos(i * 2 * Math.PI / this.sidesCount),
				this.size / 2 * Math.sin(i * 2 * Math.PI / this.sidesCount)
			);
		}
		this.ctx.fill();
		this.ctx.closePath();
		
		this.ctx.rotate(-this.radians);
		this.ctx.translate(-this.pos.x, -this.pos.y);
		this.ctx.globalAlpha = 1;
	}
}
