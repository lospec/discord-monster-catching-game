import { Store } from 'data-store';
export const PlayerStore = new Store({ path: './_data/player-data.json' });
console.log(PlayerStore);
const players = PlayerStore.get();

export const PLAYERS = {};
export const playersAutocomplete = [];

console.log(players)

Object.keys(players).forEach(playerId => {
	console.log(playerId)
	PLAYERS[playerId] = players[playerId];
	// PLAYERS[playerId].id = playerId;
	
	playersAutocomplete.push({name: playerId, value: playerId});
	playersAutocomplete.push({name: PLAYERS[playerId].name, value: playerId});
});