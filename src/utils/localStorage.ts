import { HiScoresInterface } from '../types/types';

/**
 * Save the current hi-scores to the local storage
 *
 * @param storeName
 * @param score
 */
export function saveScore(storeName: string, score: HiScoresInterface) {
	localStorage.setItem(storeName, JSON.stringify(score));
}

/**
 * Get the saved hi-scores from local storage
 *
 * @param storeName
 */
export function getScore(storeName: string): HiScoresInterface {
	const score = localStorage.getItem(storeName);
	return score ? JSON.parse(score) : [null, null, null];
}
