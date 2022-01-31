import { Bullet } from "../classes/Bullet.js";
import { Roid } from "../classes/Roid.js";

export function isBulletCollidingWithRoid(bullet: Bullet, roid: Roid): boolean {
	const sideA = bullet.pos.x - roid.pos.x;
	const sideB = bullet.pos.y - roid.pos.y;
	const distance = Math.sqrt(sideA * sideA + sideB * sideB);
	return distance <= (bullet.size + roid.size)
}
