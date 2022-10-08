import { MonsterStore } from "../monsters.js";

export class Monster {
    constructor(id, name, type, health, attack, defense, speed, level) {
        this.id = id;
        this.monName = name;
        this.type = type;
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.level = level;
    }

    static fromString(str) {
        let elems = str.split(',');
        return new Monster(elems[0], elems[1], elems[2], elems[3], elems[4], elems[5], elems[6], elems[7]);
    }

    //TODO: Skeddles figure out how stats are rolled
    static rollNew(monsterId, name) {
        let monster = MonsterStore.get(monsterId+".stats");
        let health = Math.floor(Math.random() * (monster.maxHealth - monster.minHealth) + monster.minHealth);
        let attack = Math.floor(Math.random() * (monster.maxAttack - monster.minAttack) + monster.minAttack);
        let defense = Math.floor(Math.random() * (monster.maxDefense - monster.minDefense) + monster.minDefense);
        let speed = Math.floor(Math.random() * (monster.maxSpeed - monster.minSpeed) + monster.minSpeed);
        return new Monster(monsterId, name, MonsterStore.get(monsterId+".type"), health, attack, defense, speed, 1);
    }

    toString() {
        return `${this.id},${this.monName},${this.type},${this.health},${this.attack},${this.defense},${this.speed},${this.level}`;
    }

    output() {
        return `${this.monName} is a ${this.type} type monster with ${this.health} health, ${this.attack} attack, ${this.defense} defense, and ${this.speed} speed.`;
    }

}