import { HiScoresInterface } from '../types/types';

export function saveScore(storeName: string, score: HiScoresInterface) {
	localStorage.setItem(storeName, JSON.stringify(score));
}

export function getScore(storeName: string): HiScoresInterface {
	const score = localStorage.getItem(storeName);
	return score ? JSON.parse(score) : [null, null, null];
}
