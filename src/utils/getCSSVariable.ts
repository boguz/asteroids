export function getCSSVariable(variableName: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(variableName);
}
