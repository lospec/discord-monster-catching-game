import { Store } from 'data-store';
import { MonsterGameClient } from './bot.js';
import getRarity from './utilities/calculate-rarity.js';
export const MonsterStore = new Store({ path: './_data/monster-data.json' });
	console.log(MonsterStore)
	const monsters = MonsterStore.get();
export const rarestRarity = Math.max(...Object.keys(MonsterStore.get()).map(id=>getRarity(id)));
export var runawayTimer;

export const MONSTERS = {};
export const monstersAutocomplete = [];

console.log(MonsterStore.get())

Object.keys(monsters).forEach(monsterId => {
	console.log(monsterId)
	MONSTERS[monsterId] = monsters[monsterId];
	MONSTERS[monsterId].id = monsterId;
	
	monstersAutocomplete.push({name: monsterId, value: monsterId});
	monstersAutocomplete.push({name: MONSTERS[monsterId].name, value: monsterId});
});

export var Pool = [];
Object.keys(monsters).forEach (id => {
	let numberOfSpawns = Math.pow(2, rarestRarity - getRarity(id));
	let lastNumber = Pool.length == 0? 0 : Pool[Pool.length-1].weight;
	Pool.push({id: id, rarity: getRarity(id), spawns: numberOfSpawns, weight: lastNumber + numberOfSpawns});
});
