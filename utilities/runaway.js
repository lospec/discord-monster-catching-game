import { MonsterGameConfig, MonsterGameClient } from '../bot.js';
import randomElement from './random-element.js';
import removeMonsterMessage from './remove-message.js';

export default function runAway () {
	console.log('runaway')
	if (!MonsterGameConfig.get('activeMonster')) return;

	let mName =  MonsterGameConfig.get('activeMonsterName');
	let channelid = MonsterGameConfig.get('activeMonsterChannel');


	let text = randomElement([
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

	removeMonsterMessage();

	MonsterGameClient.channels.fetch(channelid)
		.then(channel => {
			channel.send('` '+text+' `');
		}).catch(console.warn);
}