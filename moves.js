import { Store } from 'data-store';
export const MovesStore = new Store({ path: './_data/moves.json' });

export const movesAutoComplete = [];

for (let pool in MovesStore.get()) 
	for (let move in MovesStore.get(pool)) 
		movesAutoComplete.push({name: pool+' > '+move, value: pool+'.'+move});