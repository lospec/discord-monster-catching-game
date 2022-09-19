import getRarity from './calculate-rarity.js';
import { Pool } from '../bot.js';

export default function pickRandom() {
	
	let biggestNumber = Pool[Pool.length-1].weight;
	let targetNumber = Math.random() * biggestNumber;

	let i;
	for (i = 0; i < Pool.length; i++)
		if (Pool[i].weight > targetNumber) break;

		console.log('\t RANDOM MONSTER: roll',targetNumber,'/',biggestNumber,' | spawn chance ',Math.round(Pool[i].spawns/biggestNumber*100)+'%' , ' | ', Pool[i]);

	return Pool[i].id;
}