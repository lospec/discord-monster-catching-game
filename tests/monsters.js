import { TextInputStyle } from 'discordjs14';
import {MonsterGameClient, MonsterGameConfig} from '../bot.js';
import {MONSTERS,Pool,monstersAutocomplete,Monster} from '../monsters.js';

describe('Monsters', function() {


	describe('Monster class', function() {
		it('exists', function() {
			expect(Monster).toBeDefined();
		});	

		let instantiationTypes ={
			'new': ()=>new Monster('1','testname','testtype','testy',1,{health:1,attack:1,defense:1,speed:1}),
			'fromString': ()=>Monster.fromString('1,testname,testtype,testy,1,health:1|attack:1|defense:1|speed:1'),
			'rollNew': ()=>Monster.rollNew(1,'namey'),
		}

		for (let type in instantiationTypes) {
			describe('instantiated with '+type, function() {
				try {
					let monster = instantiationTypes[type]();
					it('is defined', function() {expect(monster).toBeDefined();});
					it('has all stats', function() {expect(hasAllStats(monster)).toBe(true);});
					it('can be exported toString, then instantiated again and has all stats', function() {
						console.log('the monsters tostring:', monster.toString());
						let monster2 = Monster.fromString(monster.toString());
						expect(monster.toString()).toBe(monster2.toString());
						expect(hasAllStats(monster2)).toBe(true);
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