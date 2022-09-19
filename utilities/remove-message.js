import { MonsterGameConfig, runawayTimer, MonsterGameClient } from "../bot.js";

export default function removeMonsterMessage(caught) {
    if (!MonsterGameConfig.get('activeMonster')) return;

	let channelid = MonsterGameConfig.get('activeMonsterChannel');
	let messageid = MonsterGameConfig.get('activeMonster')

	//reset active monster
	MonsterGameConfig.set('activeMonster',false);
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