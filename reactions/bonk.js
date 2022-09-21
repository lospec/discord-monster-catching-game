import removeMonsterMessage from '../utilities/remove-message.js';
import { MonsterGameConfig } from '../bot.js';

export const config = {
	emojiId: '1022205056222756954'
}

export const execute = function (reaction, user) {
	//exit if the reaction wasn't to the active monster message
	if (reaction.message.id !== MonsterGameConfig.get('activeMonster')) return 'CONTINUE';
 
	//send text
	reaction.message.channel.send('`'+user.username.toUpperCase()+' bonked the '+ MonsterGameConfig.get('activeMonsterName').toUpperCase() +' and it ran away!`');
	removeMonsterMessage();
}