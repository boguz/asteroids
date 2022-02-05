export enum GameState {
	'START' = 'START',
	'GAME' = 'GAME',
	'GAME_OVER' = 'GAME_OVER',
	'WIN' = 'WIN',
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

export type HiScoresInterface = [
	ScoreInterface | null,
	ScoreInterface | null,
	ScoreInterface | null,
];

export interface ScoreInterface {
	name: string,
	score: number,
}
