import fs from 'fs';
import { MonsterGameConfig, MonsterGameState } from "../bot.js";
import { rarestRarity } from "../monsters.js";
import getRarity from "../utilities/calculate-rarity.js";
import removeMonsterMessage from "../utilities/remove-message.js";
import { PlayerStore } from "../players.js";
import { getResponseText } from "../utilities/response-text.js";

const INTROTEXT = '```' + fs.readFileSync('_text/help.txt', 'utf8') + '```';

//reaction
export const execute = function (reaction, user) {
    //If it is on the signup message, add the role
    if (MonsterGameConfig.get('signupMessageId') == reaction.message.id)
		return newUserSignup(reaction,user);

	//exit if the reaction wasn't to the active monster message
	let activeMonster = MonsterGameState.get('activeMonster');
	if (reaction.message.id !== activeMonster) return 'CONTINUE';
	let mName =  MonsterGameState.get('activeMonsterName').toUpperCase();
	let mChip =  MonsterGameState.get('activeChippedUserId');
	let mId =  MonsterGameState.get('activeMonsterId');
	let uName = user.username.toUpperCase();

	const Ball = MonsterGameConfig.get('reactionEmojis.ball');

	//get the "guild member" (user relative to server)
	reaction.message.channel.guild.members.fetch(user.id).then(guildMember=> {

		//too difficult (extra auto lose)
		let difficulty = getRarity(mId);
		console.log('chance to miss',difficulty,'/',(rarestRarity+1), '=', (difficulty/(rarestRarity+1))*0.5)
		if (Math.random() < (difficulty/(rarestRarity+1))*0.5) {

			let text;

			//chance to keep the monster there
			if (Math.random() < 0.5) {
				text = getResponseText('ball-missed-stay', uName, mName);
			} else {
				removeMonsterMessage();
				text = getResponseText('ball-missed-dodged', uName, mName);
			}

			reaction.message.channel.send('<:Lozpekaball_Missed:837769252852465794> ` '+text+' `');
		}


		// chance to miss
		else if (Math.random() < 0.7) {
			console.log('missed');

			//create text variable, will be filled based on outcome
			let text;

			//sometimes don't remove the monster
			if (Math.random() < 0.6) {
				text = getResponseText('ball-missed-stay', uName, mName);
			} else {
				removeMonsterMessage();
				text = getResponseText('ball-missed-leave', uName, mName);
			}

			//send message
			reaction.message.channel.send('<:Lozpekaball_Missed:837769252852465794> ` '+text+' `');
		}

		//catch
		else {
			console.log(user.id, 'caught');

			//reset the monster
			removeMonsterMessage(true);

			//check if monster was chipped
			if (mChip.length == 18) { //if it was a chipped monster
				reaction.message.channel.send(Ball+' ` ' + getResponseText('caught-chipped', uName, mName)+' `');
				
				//undo the players recorded release
				let releasePath = mChip+'.'+mId+'.released';
				if (!PlayerStore.has(releasePath)) PlayerStore.set(releasePath, 0);
				PlayerStore.set(releasePath, PlayerStore.get(releasePath) -1 );
			} else //normal catch
				reaction.message.channel.send(Ball+' ` ' + getResponseText('caught-wild', uName, mName)+' `');

			let monsterPath = user.id+'.'+MonsterGameState.get('activeMonsterId')+'.owned';

			//save - create monster if not existant, otherwise increment
			if (!PlayerStore.has(monsterPath))	PlayerStore.set(monsterPath, 1);
			else PlayerStore.set(monsterPath, PlayerStore.get(monsterPath) + 1);
		}
	}).catch(d => console.log('failed to get guild member',d));
}

function newUserSignup (reaction, user) {
	//add user to the signup list
	reaction.message.channel.guild.members.fetch(user.id)
		.then(guildMember=> {
			//give user role base on matched emoji
			guildMember.roles.add(MonsterGameState.get('playerRoleId'))
				.then(e=> {
					console.log({module: 'role manager'},'GRANTED',user.username.toUpperCase(),'RESEARCHERS LICENCE');
					user.send(INTROTEXT);
				})
				.catch(e=>console.log({module: 'role manager', error: new Error('maybe failed to give '+user.username+' role')}));
			})
		.catch(d => log({module: 'role manager', error: new Error('failed to get guild member')}));
        console.log('added user ', user.id, ' to lozpekamon');
}

