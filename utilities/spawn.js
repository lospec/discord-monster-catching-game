import { MonsterGameConfig, MonsterGameClient, runawayTimer } from '../bot.js';
import removeMonsterMessage from '../utilities/remove-message.js';
import runAway from './runaway.js';
import randomElement from './random-element.js';

//spawn a monster (maybe)
export default function spawn(monster, channelId) {
    console.log('spawning',monster.name,'in',channelId);
	let monsterSendChannel = channelId ?? MonsterGameConfig.get('channel');
	if (Math.random() < -1) monsterSendChannel = randomElement(MonsterGameConfig.get('leakChannels'));

	//send it
	MonsterGameClient.channels.fetch(monsterSendChannel)
		.then(channel => {
            //delete old monster if still active
            removeMonsterMessage();

            console.log('SPAWNING MONSTER ',monster.name);

            //send the monster
            channel.send(monster.emoji).then(monsterMessage => {
                MonsterGameConfig.set('activeMonster',monsterMessage.id);
                MonsterGameConfig.set('activeMonsterName',monster.name);
                MonsterGameConfig.set('activeMonsterId',monster.id);
                MonsterGameConfig.set('activeMonsterChannel',monsterSendChannel);
                MonsterGameConfig.set('activeChipped',false);

                //send monster message
                channel.send('` A wild '+monster.name+' appeared! `');
            });


            //calculate time until monster runs away
            let length = 1000 * 60 						//1 minute
                * MonsterGameConfig.get('cooldown')	    //cooldown setting in minutes
                * Math.random()							//random (making the value above the max, and 0 the least)
                + 1000*10;								//minimum of 10 seconds
            //schedule runaway
            runawayTimer = setTimeout(runAway, length);

		}).catch(e=>console.warn);
}