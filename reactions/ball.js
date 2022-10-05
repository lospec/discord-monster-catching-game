import fs from 'fs';
import { MonsterGameConfig } from "../bot.js";
import { rarestRarity } from "../monsters.js";
import randomElement from "../utilities/random-element.js";
import getRarity from "../utilities/calculate-rarity.js";
import removeMonsterMessage from "../utilities/remove-message.js";
import { PlayerStore } from "../players.js";

const INTROTEXT = '```' + fs.readFileSync('_data/help.txt', 'utf8') + '```';

export const execute = function (reaction, user) {
    //If it is on the signup message, add the role
    if (MonsterGameConfig.get('signupMessageId') == reaction.message.id)
		return newUserSignup(reaction,user);


	//exit if the reaction wasn't to the active monster message
	let activeMonster = MonsterGameConfig.get('activeMonster');
	if (reaction.message.id !== activeMonster) return 'CONTINUE';
	let mName =  MonsterGameConfig.get('activeMonsterName').toUpperCase();
	let mChip =  MonsterGameConfig.get('activeChippedUserId');
	let mId =  MonsterGameConfig.get('activeMonsterId');
	let uName = user.username.toUpperCase();

	const Ball = MonsterGameConfig.get('reactionEmojis.ball');

	//get the "guild member" (user relative to server)
	reaction.message.channel.guild.members.fetch(user.id).then(guildMember=> {

		//some text that might be used in the message generation
		let ball = 'LOZPEKABALL';
		let runaway = randomElement(['ran off', 'got away', 'fled', 'turned and ran', 'left', 'ran away','walked away', 'walked off', 'bounced']);
		let grunt = randomElement(['Team PixelJoint grunt', 'PixelPalace grunt', 'PixelDailies grunt']);

		//too difficult (extra auto lose)
		let difficulty = getRarity(mId);
		console.log('chance to miss',difficulty,'/',(rarestRarity+1), '=', (difficulty/(rarestRarity+1))*0.5)
		if (Math.random() < (difficulty/(rarestRarity+1))*0.5) {

			let text;

			//chance to keep the monster there
			if (Math.random() < 0.5) {

				text = randomElement([
					mName+' dodged '+uName+'\'s '+ball+'!',
					mName+' evaded '+uName+'\'s '+ball+'!',
					uName + ' threw a '+ball+', but the '+mName+' hit the it out of the way!',
					uName + ' threw a '+ball+', but the '+mName+' swallowed the ball whole!',
					uName + ' threw a '+ball+', but the '+mName+' dove out of the way!',
					uName + ' threw a '+ball+', but '+mName+' jumped over it!',
					uName + ' threw a '+ball+', but the '+mName+' dipped out of the way!',
					uName + ' threw a '+ball+', but the '+mName+' dove out of the way!',
					uName + ' threw a '+ball+', but the '+mName+' ducked under it!'
				]);
			//remove the monster
			} else {

				//reset the monster
				removeMonsterMessage();

				text = randomElement([
					mName+' '+randomElement(['dodged','evaded','ducked under'])+' '+uName+'\'s '+ball+' and '+runaway+'!',
					uName+' thew a '+ball+' but missed, and the '+mName+' '+runaway+'!',
					uName+'\'s '+ball+' missed the '+mName+' and it '+runaway+'!',
				]);
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
				text = randomElement([
					uName + ' missed by so much the '+mName+' didn\'t notice.',
					uName + ' missed! '+mName+' growled!',
					uName + ' missed! '+mName+' stared menacingly!',
					uName + ' threw a '+ball+', but the '+mName+' hit it out of the air!',
					uName + ' hit the '+mName+', but the '+ball+' seemed defective...',
					uName + ' captured '+mName+', but it broke free!',
					uName + ' threw a '+ball+', but a '+grunt+' knocked it out of the way!',
				]);
			//remove the monster
			} else {
				//reset the monster
				removeMonsterMessage();

				text = randomElement([
					uName + ' missed! The '+mName+' '+runaway+'!',
					uName + ' missed! The '+mName+' '+runaway+'!',
					uName + ' missed! The '+mName+' '+runaway+'!',
					uName + ' missed! The '+mName+' '+runaway+'!',
					uName + ' missed! The startled '+mName+' '+runaway+'!',
					uName + ' missed! The frightened '+mName+' '+runaway+'!',
					uName + ' missed! The spooked '+mName+' '+runaway+'!',
					uName + ' just missed, scaring off the '+mName+'!',
					uName + ' hit the '+mName+' too hard and it died.',
					uName + ' missed! The '+mName+' stared for a moment, then '+runaway+'.',
					uName + ' caught the '+mName+', but a '+grunt+' jumped out and stomped the '+ball+' to pieces!',
					uName + ' caught the '+mName+', but a '+grunt+' jumped out and stole the '+ball+'!'
				]);
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
				reaction.message.channel.send(Ball+' ` ' + uName + ' recaught the released '+mName+'! `');
				
				//undo the players recorded release
				let releasePath = mChip+'.'+mId+'.released';
				if (!PlayerStore.has(releasePath)) PlayerStore.set(releasePath, 0);
				PlayerStore.set(releasePath, PlayerStore.get(releasePath) -1 );
			} else //normal catch
				reaction.message.channel.send(Ball+' ` ' + uName + ' caught the wild '+mName+'! `');

			//a path where the new data should be saved
			let monsterPath = user.id+'.'+MonsterGameConfig.get('activeMonsterId')+'.owned';

			//create monster if not existant
			if (!PlayerStore.has(monsterPath))
			PlayerStore.set(monsterPath, 1);
			//increment
			else PlayerStore.set(monsterPath, PlayerStore.get(monsterPath) + 1);
		}
	}).catch(d => console.log('failed to get guild member',d));

}

function newUserSignup (reaction, user) {
	//add user to the signup list
	reaction.message.channel.guild.members.fetch(user.id)
		.then(guildMember=> {
			//give user role base on matched emoji
			guildMember.roles.add(MonsterGameConfig.get('playerRoleId'))
				.then(e=> {
					console.log({module: 'role manager'},'GRANTED',user.username.toUpperCase(),'RESEARCHERS LICENCE');
					user.send(INTROTEXT);
				})
				.catch(e=>console.log({module: 'role manager', error: new Error('maybe failed to give '+user.username+' role')}));
			})
		.catch(d => log({module: 'role manager', error: new Error('failed to get guild member')}));
        console.log('added user ', user.id, ' to lozpekamon');
}