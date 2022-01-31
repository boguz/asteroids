export class Infos {
	private levelEl: HTMLParagraphElement;
	private livesEl: HTMLParagraphElement;
	private scoreEl: HTMLParagraphElement;
	
	constructor() {
		this.levelEl = document.querySelector('.infos_level')!;
		this.livesEl = document.querySelector('.infos_lives')!;
		this.scoreEl = document.querySelector('.infos_score')!;
	}
	
	update(level: number, lives: number, score: number) {
		this.levelEl.textContent = `Level:${level}`;
		this.livesEl.textContent = `Lives:${lives}`;
		this.scoreEl.textContent = `Score:${score}`;
	}
}