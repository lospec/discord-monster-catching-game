import randomElement from "../utilities/random-element.js";
import removeMonsterMessage from '../utilities/remove-message.js';
import { MonsterGameConfig } from '../bot.js';

export const execute = function (reaction, user) {
	//exit if the reaction wasn't to the active monster message
	if (reaction.message.id !== MonsterGameConfig.get('activeMonster')) return;
	
	let uName = user.username.toUpperCase();
	let mName =  MonsterGameConfig.get('activeMonsterName').toUpperCase();
 
	let text = '`'+ randomElement([
		uName + ' fed the '+mName+' some pizza. ',
		uName + ' gave the '+mName+' a slice of pizza. ',
		uName + ' gave '+mName+' some pizza. ',
	]);

	//randomly let it run away 
	if (Math.random() < 0.25) {
		reaction.message.channel.send(text + mName + ' took it and ran away!`');
		removeMonsterMessage();
	} else {
		reaction.message.channel.send(text + randomElement([
			mName + ' sniffed the pizza.',
			mName + ' is confused. ',
			mName + ' ate the pizza!',
		])+'`');
	}
}