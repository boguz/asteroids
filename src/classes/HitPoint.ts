import { PositionInterface } from '../types/types.js';

/**
 * Info shown when a roid or power up is hit by a bullet
 */
export class HitPoint {
	private ctx: CanvasRenderingContext2D;
	private pos: PositionInterface;
	private readonly points: number | string;
	private ANIMATION_DURATION: number;
	private startTime: number;
	public opacity: number;
	private readonly color: string;
	
	constructor(
		ctx: CanvasRenderingContext2D,
		pos: PositionInterface,
		points: number | string,
		color: string,
	) {
		this.ctx = ctx;
		this.pos = pos;
		this.points = points;
		this.ANIMATION_DURATION = 3000;
		this.startTime = Date.now();
		this.opacity = 1;
		this.color = color;
	}
	
	/**
	 * Draw the hit information on the canvas
	 */
	draw() {
		this.ctx.globalAlpha = this.opacity;
		this.ctx.fillStyle = this.color;
		this.ctx.font = '20px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(`${this.points}`,this.pos.x,this.pos.y);
		this.ctx.globalAlpha = 1;
	}
	
	/**
	 * Update the hit information's position and opacity
	 */
	update() {
		this.pos.y -= 1.5;
		this.opacity -= .025;
		if (this.opacity <= 0.1) {
			this.opacity = 0;
		}
	}
}
