export enum GameState {
	'START' = 'START',
	'GAME' = 'GAME',
	'END' = 'END',
}

export interface PositionInterface {
	x: number;
	y: number;
}

export interface KeysInterface {
	LEFT: boolean,
	RIGHT: boolean,
	UP: boolean,
	SPACE: boolean
}

export interface LevelInterface {
	level: number,
	numberOfRoids: number,
	maxRoidGrade: number,
	maxRoidSpeed: number,
}
