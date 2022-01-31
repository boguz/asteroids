export function utils(variableName: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(variableName);
}

// min and max included
export function randomIntFromInterval(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
