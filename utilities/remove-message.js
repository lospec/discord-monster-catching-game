import { MonsterGameState, MonsterGameClient } from "../bot.js";
import { runawayTimer } from '../monsters.js';

export default function removeMonsterMessage(caught) {
    if (!MonsterGameState.get('activeMonster')) return;

	let channelid = MonsterGameState.get('activeMonsterChannel');
	let messageid = MonsterGameState.get('activeMonster')

	//reset active monster
	MonsterGameState.set('activeMonster',false);
	MonsterGameState.set('activeChippedUserId',false);
	clearTimeout(runawayTimer);

	console.log('deleting message',channelid,messageid)
	//fetch channel
	MonsterGameClient.channels.fetch(channelid)
		.then(channel => {

			//fetch message
			channel.messages.fetch(messageid)
			    .then(message => {
					//message.delete();
					if (caught) message.edit('<:Caughtzpekamon:841091921295310860>');
					else message.edit('<:Nozpekamon:841000792097423391>');
					console.log('deleted message')
			    })
			    .catch(console.error)
		})
		.catch(e=>console.error);
}