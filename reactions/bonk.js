import removeMonsterMessage from '../utilities/remove-message.js';
import { MonsterGameState } from '../bot.js';

export const execute = function (reaction, user) {
	//exit if the reaction wasn't to the active monster message
	if (reaction.message.id !== MonsterGameState.get('activeMonster')) return;
 
	//send text
	reaction.message.channel.send('`'+user.username.toUpperCase()+' bonked the '+ MonsterGameState.get('activeMonsterName').toUpperCase() +' and it ran away!`');
	removeMonsterMessage();
}