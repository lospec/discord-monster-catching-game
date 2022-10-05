import randomElement from "../utilities/random-element.js";
import removeMonsterMessage from '../utilities/remove-message.js';
import { MonsterGameState } from '../bot.js';

export const execute = function (reaction, user) {
	//exit if the reaction wasn't to the active monster message
	if (reaction.message.id !== MonsterGameState.get('activeMonster')) return;
	
	let uName = user.username.toUpperCase();
	let mName =  MonsterGameState.get('activeMonsterName').toUpperCase();

	let text = '`'+ randomElement([
		uName + ' looked at the '+mName+'. ',
		uName + ' stared at the '+mName+'. ',
		uName + ' eyed the '+mName+'. ',
		uName + ' noticed the '+mName+'. ',
	]);

	//randomly let it run away 
	if (Math.random() < 0.25) {
		reaction.message.channel.send(text + mName +' ran away scared!`');
		removeMonsterMessage();
	} else {
		reaction.message.channel.send(text + randomElement([
			mName + ' stared back.',
			mName + ' looked back.',
			mName + ' looked back. MENACINGLY.',
			mName + ' is now confused!',
		])+'`');
	}
}