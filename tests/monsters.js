import { TextInputStyle } from 'discordjs14';
import {MonsterGameClient} from '../bot.js';
import {MONSTERS,Pool,monstersAutocomplete,Monster} from '../monsters.js';

describe('Monsters', function() {


	describe('Monster class', function() {
		it('exists', function() {
			expect(Monster).toBeDefined();
		});	

		describe('instantiated with new', function() {
			let monster = new Monster('1','test','test',1,{});
			it('is defined', function() {expect(monster).toBeDefined();});
		});

		describe('instantiated with fromString', function() {
			let monster = Monster.fromString('1,test,test,1,{}');
			it('is defined', function() {expect(monster).toBeDefined();});
		});

		describe('instantiated with rollNew', function() {
			let monster = Monster.rollNew(1,'namey');
			it('is defined', function() {expect(monster).toBeDefined();});
		});
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