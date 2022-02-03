import { Bullet } from "../classes/Bullet.js";
import { Roid } from "../classes/Roid.js";
import { Player } from "../classes/Player.js";

export function areTwoElementsColliding(elOne: Bullet | Player, elTwo: Roid): boolean {
	const sideA = elOne.pos.x - elTwo.pos.x;
	const sideB = elOne.pos.y - elTwo.pos.y;
	const distance = Math.sqrt(sideA * sideA + sideB * sideB);
	return distance <= (elOne.size + elTwo.size);
}
