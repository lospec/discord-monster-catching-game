import { Store } from 'data-store';
import getRarity from './utilities/calculate-rarity.js';
import runAway from './utilities/runaway.js';
import { MonsterGameConfig } from './bot.js';
import randomElement from "./utilities/random-element.js";
export const MonsterStore = new Store({ path: './_data/monster-data.json' });
	console.log(MonsterStore)
	const monsters = MonsterStore.get();
export const rarestRarity = Math.max(...Object.keys(MonsterStore.get()).map(id=>getRarity(id)));
export var runawayTimer;
export function setRunaway(length) {
	clearTimeout(runawayTimer);
	runawayTimer = setTimeout(runAway, length);
}

export const MONSTERS = {};
export const monstersAutocomplete = [];

export class Monster {
    constructor(id, name, type, level, stats) {
        this.id = id;
        this.monName = name;
        this.type = type;
        this.stats = stats;
        this.level = level;
		this.personality = randomElement(MonsterGameConfig.get('personalities'));
    }

    static fromString(str) {
		let [id, name, type, level, stats] = str.split(',');
        return new Monster(id, name, type, level, stats);
    }

    static rollNew(monsterId, name) {
        let monster = MonsterStore.get(String(monsterId));
		console.log('rolling new monster:', monsterId, name, monster)
		let newStats = {};
		Object.entries(monster.stats).forEach(s => newStats[s[0]] = s[1].min);

		let statPointsPool = 8;
		Object.values(monster.resistances).forEach(r => statPointsPool-=r);
		Object.values(monster.weaknesses).forEach(w => statPointsPool+=w);
		Object.values(newStats).forEach(s => statPointsPool-=s.min);

		while (statPointsPool > 0) {
			let stat = randomElement(monster.stats);
			if (newStats[stat] + 1 > monster.stats[stat].max) continue;
			newStats[stat]++;
		}

        return new Monster(monsterId, name, MonsterStore.get(monsterId+".type"), 1, newStats);
    }

    toString() {
        return `${this.id},${this.monName},${this.type},${this.personality},${this.level},${this.statsText}`;
    }

    output() {
        return `${this.monName} is a ${this.type} type monster with ${this.statsText}.`;
    }

	get statsText () {
		console.log('get statstest:', {
			'stats': this.stats,
			'list': Object.entries(this.stats),

		})
		return Object.entries(this.stats).map(s => s[0].toUpperCase()+': '+s[1]).join(' | ');
	}
}

Object.keys(monsters).forEach(monsterId => {
	console.log(monsterId)
	MONSTERS[monsterId] = monsters[monsterId];
	MONSTERS[monsterId].id = monsterId;
	
	//monstersAutocomplete.push({name: monsterId, value: monsterId});
	monstersAutocomplete.push({name: MONSTERS[monsterId].name, value: monsterId});
});

export var Pool = [];
Object.keys(monsters).forEach (id => {
	let numberOfSpawns = Math.pow(2, rarestRarity - getRarity(id));
	let lastNumber = Pool.length == 0? 0 : Pool[Pool.length-1].weight;
	Pool.push({id: id, rarity: getRarity(id), spawns: numberOfSpawns, weight: lastNumber + numberOfSpawns});
});
