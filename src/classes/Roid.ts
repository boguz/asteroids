import { PositionInterface } from '../types/types.js';
import { randomIntFromInterval } from '../utils/utils.js';

export class Roid {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	public pos: PositionInterface;
	public grade: number;
	public size: number;
	private direction: number;
	private vel: { x: number, y: number };
	private speed: number;
	private color: string;
	public points: number;
	
	private sizes = [20, 30, 40, 50, 60];
	private possiblePoints = [400, 300, 200, 100, 50];
	
	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		grade: number | null,
		maxRoidGrade: number,
		maxRoidSpeed: number,
		possibleColors: string[],
		startPos: PositionInterface | null)
	{
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
		this.ctx.beginPath();
		this.ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
		this.ctx.closePath();
	}
}
