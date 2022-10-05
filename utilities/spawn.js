import { MonsterGameConfig, MonsterGameState, MonsterGameClient } from '../bot.js';
import { setRunaway, MonsterStore } from '../monsters.js';
import removeMonsterMessage from '../utilities/remove-message.js';
import randomElement from './random-element.js';
import pickRandom from './pick-random.js';

//spawn a monster (maybe)
export default function spawn(spawnId, channelId, chippedUserId=false) {
    let monsters = MonsterStore.get();
    let monster = spawnId ? monsters[spawnId] : monsters[pickRandom()];
    console.log('spawning', monster.name, 'in', channelId);
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
                MonsterGameState.set('activeMonster',monsterMessage.id);
                MonsterGameState.set('activeMonsterName',monster.name);
                MonsterGameState.set('activeMonsterId', spawnId);
                MonsterGameState.set('activeMonsterChannel',monsterSendChannel);
                MonsterGameState.set('activeChippedUserId', chippedUserId);
                
                //send monster message
                if (!chippedUserId) {
                    channel.send('` A wild '+monster.name+' appeared! `');
                }
            });


            //calculate time until monster runs away
            let length; 
            if (chippedUserId) {
                length = 1000 * 15 - 1000 * 10 * Math.random(); // 5-15 seconds
            }
            else {
                length = 1000 * 60 						//1 minute
                * MonsterGameConfig.get('cooldown')	    //cooldown setting in minutes
                * Math.random()							//random (making the value above the max, and 0 the least)
                + 1000*10;								//minimum of 10 seconds
            }

            //schedule runaway
            setRunaway(length);

		}).catch(e=>console.warn);
}