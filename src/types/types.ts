export enum GameState {
	'START' = 'START',
	'GAME' = 'GAME',
	'GAME_OVER' = 'GAME_OVER',
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
