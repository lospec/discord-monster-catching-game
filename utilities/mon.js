import { MonsterStore } from "../monsters.js";
import randomElement from "./random-element.js";

export class Monster {
    constructor(id, name, type, stats, level) {
        this.id = id;
        this.monName = name;
        this.type = type;
        this.stats = stats;
        this.level = level;
    }

    static fromString(str) {
        let elems = str.split(',');
        return new Monster(elems[0], elems[1], elems[2], elems[3], elems[4], elems[5], elems[6], elems[7]);
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

        return new Monster(monsterId, name, MonsterStore.get(monsterId+".type"), newStats, 1);
    }

    toString() {
        return `${this.id},${this.monName},${this.type},${this.level},${this.statsText}`;
    }

    output() {
        return `${this.monName} is a ${this.type} type monster with ${this.statsText}.`;
    }

	get statsText () {
		return Object.entries(this.stats).map(s => s[0].toUpperCase()+': '+s[1]).join(' | ');
	}
}