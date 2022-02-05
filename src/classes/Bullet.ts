import { PositionInterface } from '../types/types.js';

export class Bullet {
	private ctx: CanvasRenderingContext2D;
	public pos: PositionInterface;
	private direction: number;
	private grade: number;
	private color: string;
	size: number;
	private vel: { x: number; y: number };
	
	
	constructor(ctx: CanvasRenderingContext2D, pos: PositionInterface, direction: number, grade: number, color: string) {
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
