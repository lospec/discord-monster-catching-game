import { TextInputStyle } from 'discordjs14';
import {MonsterGameClient, MonsterGameConfig} from '../bot.js';
import {MONSTERS,Pool,monstersAutocomplete,Monster} from '../monsters.js';

describe('Monsters', function() {

	describe('data', function() {
		it('exists', function() {	expect(MonsterGameConfig).toBeDefined();});
		it('to have at least one monster', function() {expect(Object.keys(MONSTERS).length).toBeGreaterThan(0);});
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
			'new': ()=>new Monster('1','testname','testtype','Funny',1,{health:1,attack:1,defense:1,speed:1}),
			'fromString': ()=>Monster.fromString('1,testname,testtype,Funny,1,health:1|attack:1|defense:1|speed:1'),
			'rollNew': ()=>Monster.rollNew(1,'namey'),
		}

		for (let type in instantiationTypes) {
			describe('can be instantiated with '+type, function() {
				try {
					let monster = instantiationTypes[type]();
					it('is defined', function() {expect(monster).toBeDefined();});
					it('has all stats', function() {expect(hasAllStats(monster)).toBe(true);});
					it('has a personality', function() {expect(monster.personality).toBeDefined();});
					it('can be exported toString, then instantiated again and has all stats', function() {
						console.log('the monsters tostring:', monster.toString());
						let monster2 = Monster.fromString(monster.toString());
						expect(monster.toString()).toBe(monster2.toString());
						expect(hasAllStats(monster2)).toBe(true);
						expect(monster.personality).toBeDefined();
						expect([monster,monster2].every(m => Object.keys(m.stats).every(stat => m.stats[stat] == monster2.stats[stat]))).toBe(true);
						console.log('monster2',monster2);
					});
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