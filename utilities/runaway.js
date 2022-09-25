import { MonsterGameConfig, MonsterGameClient } from '../bot.js';
import randomElement from './random-element.js';
import removeMonsterMessage from './remove-message.js';

export default function runAway() {
	console.log('runaway')
	if (!MonsterGameConfig.get('activeMonster')) return;

	let mName =  MonsterGameConfig.get('activeMonsterName');
	let monsterId = MonsterGameConfig.get('activeMonsterId');
	let channelid = MonsterGameConfig.get('activeMonsterChannel');
	let chipped = MonsterGameConfig.get('activeChipped');

	let text;
	if (chipped) {
		text = randomElement([
			'The released '+mName+' scampered off.',
			'The released '+mName+' ran off.',
			'The released '+mName+' went happily on it\'s way.',
		]);
		let monsterReleasedPath = 'monsters.'+monsterId+'.released';
		if (!MonsterGameConfig.has(monsterReleasedPath)) MonsterGameConfig.set(monsterReleasedPath, 1);
		else MonsterGameConfig.set(monsterReleasedPath, MonsterGameConfig.get(monsterReleasedPath) + 1);
	}
	else {
		text = randomElement([
			'The wild '+mName+' got spooked and ran off!',
			'The wild '+mName+' wandered off...',
			'The wild '+mName+' wandered away...',
			'The wild '+mName+' walked away...',
			'The wild '+mName+' walked off...',
			'The wild '+mName+' zipped off into the distance!',
			'The wild '+mName+' skeddaddled.',
			'The wild '+mName+' disappeared...',
			'The wild '+mName+' was gone without a trace...',
			'The wild '+mName+' sauntered off...',
			'The wild '+mName+' left...'
		]);
	}
	

	removeMonsterMessage();

	MonsterGameClient.channels.fetch(channelid)
		.then(channel => {
			channel.send('` '+text+' `');
		}).catch(console.warn);
}