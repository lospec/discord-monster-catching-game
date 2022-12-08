import {MonsterGameClient} from '../bot.js';
import {MONSTERS,Pool,monstersAutocomplete} from '../monsters.js';

describe('Monsters', function() {

	it('exports MONSTERS object', function() {
		expect(MONSTERS).toBeDefined();
	});

	it('exports Pool array', function() {
		expect(Pool).toBeDefined();
	});

	it('exports monstersAutocomplete array', function() {	
		expect(monstersAutocomplete).toBeDefined();
	});
});