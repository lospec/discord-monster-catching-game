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

export class Monster {
    constructor(id, name, type, personality, level, stats) {
        this.id = id;
        this.monName = name;
        this.type = type;
        this.level = level;
		this.stats = stats || {};
		this.personality = personality;
			console.log('stats:',stats)
		//if any stats from MonsterGameConfig are missing throw error
		MonsterGameConfig.get('stats').forEach(s => {
			if (!this.stats.hasOwnProperty(s)) throw new Error(`Monster ${this.monName} is missing stat ${s}`);
		});

		console.log('created monster', this)
    }

    static fromString(inputString) {
		let [id, name, type, personality, level, statsRaw] = inputString.split(',');
		console.log('parsing monster:', {id, name, type, personality,  level, statsRaw, inputString});

		//parse stats
		let stats = {};
		statsRaw.split('|').forEach(s => {
			let [stat, value] = s.split(':');
			stats[stat.toLowerCase()] = Number(value);
		});
		console.log('made stats:',stats)
		
        return new Monster(id, name, type, personality, level, stats);
    }

    static rollNew(monsterId, name) {
        let monster = MonsterStore.get(String(monsterId));
		console.log('rolling new monster:', monsterId, name, monster)
		let newStats = {};
		Object.entries(monster.stats).forEach(s => newStats[s[0]] = s[1].min);
console.log('added stats:', newStats)
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

        return new Monster(monsterId, name, personality, MonsterStore.get(monsterId+".type"), 1, newStats);
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
