import randomElement from "../utilities/random-element.js";
import { MonsterGameConfig } from '../bot.js';

export const execute = function (reaction, user) {
	//exit if the reaction wasn't to the active monster message
	if (reaction.message.id !== MonsterGameConfig.get('activeMonster')) return 'CONTINUE';
 
	let uName = user.username.toUpperCase();
	let mName =  MonsterGameConfig.get('activeMonsterName').toUpperCase();
 
	let text = '`' + uName+' waved at the '+mName+'. ' + 
		randomElement(['',
				 	'The '+mName+' waved back.',
			 		'The '+mName+' blinked.',
			 		'The '+mName+' did nothing.',
			 		'The '+mName+' growled.',
				]) + '`';

	//send text
	reaction.message.channel.send(text);

}