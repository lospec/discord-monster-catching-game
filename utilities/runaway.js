import { MonsterGameState, MonsterGameClient } from '../bot.js';
import { MonsterStore } from '../monsters.js';
import removeMonsterMessage from './remove-message.js';
import { getResponseText } from "../utilities/response-text.js";

export default function runAway() {
	console.log('runaway')
	if (!MonsterGameState.get('activeMonster')) return;

	let mName =  MonsterGameState.get('activeMonsterName');
	let monsterId = MonsterGameState.get('activeMonsterId');
	let channelid = MonsterGameState.get('activeMonsterChannel');
	let chipped = MonsterGameState.get('activeChippedUserId').length == 18;

	let text;
	if (chipped) {
		text = getResponseText('released','n/a',mName);
		let monsterReleasedPath = monsterId+'.released';
		if (!MonsterStore.has(monsterReleasedPath)) MonsterStore.set(monsterReleasedPath, 1);
		else MonsterStore.set(monsterReleasedPath, MonsterStore.get(monsterReleasedPath) + 1);
	}
	else {
		text = getResponseText('leave','n/a',mName);
	}
	

	removeMonsterMessage();

	MonsterGameClient.channels.fetch(channelid)
		.then(channel => {
			channel.send('` '+text+' `');
		}).catch(console.warn);
}