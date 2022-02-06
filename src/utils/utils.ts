/**
 * Get value of a CSS Variable
 *
 * @param variableName
 */
export function getCSSVariableValue(variableName: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(variableName);
}

/**
 * Return a random number from a given interval, max and min included
 *
 * @param min
 * @param max
 */
export function randomIntFromInterval(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
