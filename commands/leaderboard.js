import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameClient } from '../bot.js';
import { PlayerStore } from '../players.js';

export const config = {
	name: 'leaderboard', 
	description: 'see the top 10 researchers',
	type: ApplicationCommandType.ChatInput,
	
};

export const execute = async function (interaction) {
    let players = PlayerStore.get();

	//convert to array
	players = Object.entries(players);

	players = players.map(p => {
		if (Object.keys(p[1]).length == 0 ||  Object.values(p[1]).length == 0) return;
		return {
			id: p[0],
			unique: Object.keys(p[1]).length,
			total: Object.values(p[1]).map(a => a.owned).reduce((a,b) => a + b),
		};
	});

	//sort players first by uniques, then by total
	players.sort((a,b) => b.unique - a.unique || b.total - a.total);

	//limit array size
	players = players.slice(0,10);

	//start fetching all users
	let userFetch = [];
	players.forEach(p => userFetch.push(MonsterGameClient.users.fetch(p.id)));

	let text = '';

	//when fetch is done on all users
	Promise.all(userFetch).then(e => {
		//loop through all players
		e.forEach((user,i) => {
			let player = players.find(p => p.id == user.id);
			text+= '\n ['+(i+1)+'] '+ user.username.toUpperCase() + '  ('+player.unique+'|'+player.total+')';
		});

		//send
		interaction.reply('``` TOP LOZPEKAMON RESEARCHERS (UNIQUE|TOTAL): '+text+' ```');
	})
	.catch(console.warn);
}