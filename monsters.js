import { Store } from 'data-store';
import getRarity from './utilities/calculate-rarity.js';
import runAway from './utilities/runaway.js';
import { MonsterGameConfig } from './bot.js';
import randomElement from "./utilities/random-element.js";
import { typeOf } from 'data-store/utils.js';
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
Object.keys(monsters).forEach(monsterId => {
	console.log(monsterId)
	MONSTERS[monsterId] = monsters[monsterId];
	MONSTERS[monsterId].id = monsterId;
	
	//monstersAutocomplete.push({name: monsterId, value: monsterId});
	monstersAutocomplete.push({name: MONSTERS[monsterId].name, value: monsterId});
});

export class Monster {
    constructor(id, name, type, personality, level, stats) {
        this.id = id;
			if (!MONSTERS.hasOwnProperty(this.id)) throw new Error('invalid monster id');
        this.monName = name;
			if (typeof this.monName !== 'string' || this.monName.length < 1) throw new Error('invalid name');
        this.type = type;
			if (!MonsterGameConfig.get('types').includes(this.type)) throw new Error('invalid type');
		this.personality = personality;
			if (!MonsterGameConfig.get('personalities').includes(this.personality)) throw new Error('invalid personality');
        this.level = level;
			if (isNaN(this.level)) throw new Error('invalid level');
		this.stats = stats || {};
			MonsterGameConfig.get('stats').forEach(s => {
				if (!this.stats.hasOwnProperty(s)) throw new Error('missing '+s+' stat');
				if (isNaN(this.stats[s])) throw new Error('invalid '+s+' stat');
			});
			Object.keys(this.stats).forEach(s => {
				if (!MonsterGameConfig.get('stats').includes(s)) throw new Error('invalid stat '+s);
			});		
	}

    static fromString(inputString) {
		if (typeof inputString !== 'string') throw new Error('invalid input string');
		let [id, name, type, personality, level, statsRaw] = inputString.split(',');

		//parse stats
		let stats = {};
		statsRaw.split('|').forEach(s => {
			let [stat, value] = s.split(':');
			stats[stat.toLowerCase()] = Number(value);
		});
		
        return new Monster(id, name, type, personality, level, stats);
    }

    static rollNew(monsterId, name) {
        let monster = MonsterStore.get(String(monsterId));
		if (!monster) throw new Error('invalid monster id');
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

		let personality = randomElement(MonsterGameConfig.get('personalities'));

        return new Monster(monsterId, name, MonsterStore.get(monsterId+".type"),personality, 1, newStats);
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
		return Object.entries(this.stats).map(s => s[0].toLowerCase()+':'+s[1]).join('|');
	}


}


export var Pool = [];
Object.keys(monsters).forEach (id => {
	let numberOfSpawns = Math.pow(2, rarestRarity - getRarity(id));
	let lastNumber = Pool.length == 0? 0 : Pool[Pool.length-1].weight;
	Pool.push({id: id, rarity: getRarity(id), spawns: numberOfSpawns, weight: lastNumber + numberOfSpawns});
});
