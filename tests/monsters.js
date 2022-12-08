import { TextInputStyle } from 'discordjs14';
import {MonsterGameClient, MonsterGameConfig} from '../bot.js';
import {MONSTERS,Pool,monstersAutocomplete,Monster} from '../monsters.js';

describe('Monsters', function() {

	describe('data', function() {
		it('exists', function() {	expect(MonsterGameConfig).toBeDefined();});
		it('to have at least one monster', function() {expect(Object.keys(MONSTERS).length).toBeGreaterThan(0);});
		describe('to have valid first monster', function() {
			let firstMonster = MONSTERS[Object.keys(MONSTERS)[0]];
			it('exists', function() {expect(firstMonster).toBeDefined();});
			it('has a valid type', function() {expect(MonsterGameConfig.get('types').includes(firstMonster.type)).toBe(true);});
			it('has a valid habitat', function() {expect(MonsterGameConfig.get('habitats').includes(firstMonster.habitat)).toBe(true);});
			it('has valid stats', function() {
				expect(Object.keys(firstMonster.stats).every(s => {
					let stat = firstMonster.stats[s];
					return typeof stat.min == 'number' &&  typeof stat.max == 'number';
				})).toBe(true);
			});
		});
				
		it('only contains numbers as keys', function() {expect(Object.keys(MONSTERS).every(k => !isNaN(k))).toBe(true);});
	});

	describe('config', function() {
		it('exists', function() {	expect(MonsterGameConfig).toBeDefined();});
		it('has a valid stats array', function() {
			expect(MonsterGameConfig.get('stats')).toBeDefined();
			expect(Array.isArray(MonsterGameConfig.get('stats'))).toBe(true);
			expect(MonsterGameConfig.get('stats').length).toBeGreaterThan(0);
		});
		it('has a valid personalities array', function() {
			expect(MonsterGameConfig.get('personalities')).toBeDefined();
			expect(Array.isArray(MonsterGameConfig.get('personalities'))).toBe(true);
			expect(MonsterGameConfig.get('personalities').length).toBeGreaterThan(0);
		});
		it('has a valid monster types array', function() {
			expect(MonsterGameConfig.get('types')).toBeDefined();
			expect(Array.isArray(MonsterGameConfig.get('types'))).toBe(true);
			expect(MonsterGameConfig.get('types').length).toBeGreaterThan(0);
		});
	});
		

	describe('class', function() {
		it('exists', function() {
			expect(Monster).toBeDefined();
		});	

		let instantiationTypes ={
			'new': ()=>new Monster('1','testname','Fish','Funny',1,{health:1,attack:1,defense:1,speed:1}),
			'fromString': ()=>Monster.fromString('1,testname,Fish,Funny,1,health:1|attack:1|defense:1|speed:1'),
			'rollNew': ()=>Monster.rollNew(1,'namey'),
			'rollNew toString fromString': ()=>Monster.fromString(Monster.rollNew(1,'namey').toString()),
		}

		for (let type in instantiationTypes) {
			describe('can be instantiated with '+type, function() {
				try {
					let monster = instantiationTypes[type]();
					it('is defined', function() {expect(monster).toBeDefined();});
					it('has all stats', function() {expect(hasAllStats(monster)).toBe(true);});
					it('has a valid personality', function() {expect(MonsterGameConfig.get('personalities').includes(monster.personality)).toBe(true);});
					it('has a valid type', function() {expect(MonsterGameConfig.get('types').includes(monster.type)).toBe(true);});

				}
				catch (e) {
					it('should not throw an error', function() {expect(e).toBeUndefined()});
				}
			});	
		}
	});

	it('exports MONSTERS object', function() {
		expect(MONSTERS).toBeDefined();
		expect(Object.keys(MONSTERS).length).toBeGreaterThan(0);
	});

	it('exports Pool array', function() {
		expect(Pool).toBeDefined();
	});

	it('exports monstersAutocomplete array', function() {	
		expect(monstersAutocomplete).toBeDefined();
	});
});

function hasAllStats(monster) {
	for (let stat of MonsterGameConfig.get('stats')) {
		if (!monster.stats.hasOwnProperty(stat)) return 'missing stat: '+stat;
	}
	return true;
}