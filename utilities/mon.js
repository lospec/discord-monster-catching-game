import { MonsterStore } from "../monsters.js";
import { MonsterGameConfig } from '../bot.js';
import randomElement from "./random-element.js";

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
        let elems = str.split(',');
        return new Monster(elems[0], elems[1], elems[2], elems[4], elems[5], elems[6], elems[7], elems[8]);
    }

    static rollNew(monsterId, name) {
        let monster = MonsterStore.get(monsterId);
		
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