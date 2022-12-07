const monsters = require('../monsters');


describe('Monsters', function() {

	it('exports MONSTERS object', function() {
		expect(monsters.MONSTERS).toBeDefined();
	});

	it('exports Pool array', function() {
		expect(monsters.Pool).toBeDefined();
	});

	it('exports monstersAutocomplete array', function() {	
		expect(monsters.monstersAutocomplete).toBeDefined();
	});
});