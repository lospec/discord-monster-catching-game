import removeMonsterMessage from '../utilities/remove-message.js';
import { MonsterGameState } from '../bot.js';

export const execute = function (reaction, user) {
	//exit if the reaction wasn't to the active monster message
	if (reaction.message.id !== MonsterGameState.get('activeMonster')) return;
 
	let uName = user.username.toUpperCase();
	let mName =  MonsterGameState.get('activeMonsterName').toUpperCase();

	//send long text
	if (Math.random() < 0.02)
		reaction.message.channel.send('`'+uName+' fired a gun at the'+mName+'. The bullet struck '+mName+' in the abdomen, and it began to bleed out. It attempted to crawl away, but the injury was too great. Other Lozpekamon trainers jumped in and tried to stop the bleeding. It was too injured to treat on-site, so they rushed it to the closest Lozpekamon center, where it was taken in by the doctors who attempted to save it. The trainers waited while the doctors performed emergency surgery. After 11 long hours, a doctor entered the waiting room with a solemn look on his face. "We did everything we could, but the injuries were too great. The '+mName+'+ passed away. I\'m very sorry for your loss." The doctor broke down into tears. "Whoever did this is the real monster."`');

	//send normal text
	else
		reaction.message.channel.send('`'+uName+' fired a gun at the '+mName+'. The gun missed, but the loud noise scared off the lozpekamon.`');
	
	removeMonsterMessage();
}