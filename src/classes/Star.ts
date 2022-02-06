import { PositionInterface } from '../types/types';
import { randomIntFromInterval } from '../utils/utils';

/**
 * Background star element
 */
export class Star {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private readonly color: string;
	private pos: PositionInterface;
	private readonly size: number;
	
	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		color: string
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.color = color;
		this.pos = {
			x: Math.random() * this.canvas.width,
			y: Math.random() * this.canvas.height,
		};
		this.size = randomIntFromInterval(1, 2);
	}
	
	/**
	 * Draw a star on the canvas
	 */
	draw() {
		this.ctx.globalAlpha = .5;
		this.ctx.beginPath();
		this.ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
		this.ctx.closePath();
		this.ctx.globalAlpha = 1;
	}
}
