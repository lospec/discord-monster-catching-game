const store = require('data-store');
const monsterCatcherData = new store({ path: 'monster-catching-game-data.json' });
const habitats = ['Plains', 'Cities', 'Volcanos', 'Mountains', 'Forests', 'Rivers', 'Ocean', 'Jungles', 'Underground', 'Swamps', 'Deserts'];
const types = ['Mammal', 'Reptile', 'Avian', 'Polygonoid', 'Fish', 'Insect', 'Crustacean', 'Amphibian', 'Mollusk', 'Fungi', 'Jellyfish', 'Plant', 'Worm'];

const Ball = monsterCatcherData.get('ballEmojiId');
const NBall = monsterCatcherData.get('nitroBallEmojiId');
var runawayTimer;
const CMD = monsterCatcherData.get('command') || '!monster';
const CHANNEL = monsterCatcherData.get("channel");
var ADMINCHANNEL = monsterCatcherData.get("adminChannel");

const getRarity = require('./utilities/calculate-rarity.js');
const rarestRarity = Math.max(...Object.keys(monsterCatcherData.get('monsters')).map(id=>getRarity(id)))

var Pool = [];
Object.keys(monsterCatcherData.get('monsters')).forEach (id => {
	let numberOfSpawns = Math.pow(2, rarestRarity - getRarity(id));
	let lastNumber = Pool.length == 0? 0 : Pool[Pool.length-1].weight;
	Pool.push({id: id, rarity: getRarity(id), spawns: numberOfSpawns, weight: lastNumber + numberOfSpawns});
});

function pickRandom () {
	let biggestNumber = Pool[Pool.length-1].weight;
	let targetNumber = Math.random() * biggestNumber;

	let i;
	for (i = 0; i < Pool.length; i++)
		if (Pool[i].weight > targetNumber) break;

		console.log('\t RANDOM MONSTER: roll',targetNumber,'/',biggestNumber,' | spawn chance ',Math.round(Pool[i].spawns/biggestNumber*100)+'%' , ' | ', Pool[i]);

	return Pool[i].id;
}



const INTROTEXT = `\`\`\`
Hello there! Welcome to the world of Lozpekamon!
Lozpekistan is inhabited by creatures called Lozpekamon!
Help us learn more about these creatures by capturing
them in lozpekaballs, so they can be studied!

To catch a lozpekamon, you first must find one!
They've recently been seen wandering around
the #lozpekistan-fields channel, so keep an eye out!

When you find one, act quickly! They may run
away, or another researcher might get it first!

To use a lozpekaball, react to the monster
image that pops up with the lozpekaball emoji!

They aren't always so easy to catch though,
and if you miss they'll run away!

There are a few commands you can use, starting with:
    !lozpekamon               [alias: !lzpkmn or !lm]

To view the monsters you've already recorded:
    !lozpekamon dex           [alias: d]

To learn more about a monster you caught:
    !lozpekamon dex 0   (replace 0 with monster #)
      (if enough are caught, a description is unlocked)

To see the top researchers:
    !lozpekamon researchers   [alias: r]

Give a lozpekamon to another player:
    !lozpekmon give @user_tag 0  (replace 0 with monster #)
      (feel free to trade for monsters, art, or whatever!)

In order to learn more about the Lozpekamon, we need to
microchip them and release them into the wild. If enough people
do this, we'll unlock more information on that monster!
    !lozpekamon release 0      (replace 0 with monster #)

Good luck on your Lozpekamon journey!

>>Also try Lozpekistan Monster Farm!
https://skeddles.itch.io/lozpekistan-monster-farm

\`\`\``;

//random monster appearence
setInterval(spawn, 1000 * 60 * monsterCatcherData.get('cooldown') * (1.25 - Math.random()*0.5)); //check every COOLDOWN minutes

//send a message in the admin channel
function alertAdmin (text, pingAdmins) {
	client.channels.fetch(ADMINCHANNEL)
		.then(channel => {
			
			channel.send((pingAdmins?'@here ':'') + text);
		}).catch(e=>console.warn);
}

//spawn a monster (maybe)
function spawn(spawnId) {

	if (!CONFIG.botChatChannel)	throw new Error('botChatChannel not defined');

	//decide if a monster should appear
	/*let check = Math.random();
	let chance = monsterCatcherData.get("appearenceChance") || 0.1;
		console.log('monster check',check,'>',chance,check>chance?'check failed, no spawn':'pass');
	if (check > chance) return;*/

	let monsterSendChannel = CHANNEL;
	if (Math.random() < -1) monsterSendChannel = random(monsterCatcherData.get("leakChannels"));

	//send it
	client.channels.fetch(monsterSendChannel)
		.then(channel => {

			//get last message
		    channel.messages.fetch({ limit: 1 })
			    .then(messages => {

			    	//skip if last message was from bot
			    	let user = messages.first().author;
			    	//if (user.bot && user.username == 'Lospec Bot') return console.log('skipping spawn, last message was bot');

					//pick a random monster
					let monsters = monsterCatcherData.get('monsters');
					let randomMonsterId = pickRandom();
					let monster = monsters[randomMonsterId];


					//delete old monster if still active
					removeMonsterMessage();

					console.log('SPAWNING MONSTER ',monster.name);

					//send the monster
					channel.send(monster.emoji).then(monsterMessage => {
						monsterCatcherData.set('activeMonster',monsterMessage.id);
						monsterCatcherData.set('activeMonsterName',monster.name);
						monsterCatcherData.set('activeMonsterId',randomMonsterId);
						monsterCatcherData.set('activeMonsterChannel',monsterSendChannel);
						monsterCatcherData.set('activeChipped',false);

						//send monster message
						channel.send('` A wild '+monster.name+' appeared! `');
					});


					//calculate time until monster runs away
					let length = 1000 * 60 						//1 minute
						* monsterCatcherData.get('cooldown')	//cooldown setting in minutes
						* Math.random()							//random (making the value above the max, and 0 the least)
						+ 1000*10;								//minimum of 10 seconds
					//schedule runaway
					runawayTimer = setTimeout(runAway, length);

			    }).catch(console.warn);
		}).catch(e=>console.warn);
}


//every 0-5 minutes, it checks if there's a monster active, and if so makes it run away
function runAway () {
	console.log('runaway')
	if (!monsterCatcherData.get('activeMonster')) return;

	let mName =  monsterCatcherData.get('activeMonsterName');
	let channelid = monsterCatcherData.get('activeMonsterChannel');


	let text = random([
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

	client.channels.fetch(channelid)
		.then(channel => {
			channel.send('` '+text+' `');
		}).catch(console.warn);
}

new Module('lozpekamon signup', 'react', {CHANNEL: '553806751808487434'}, function (message,user,reaction) {

	//make sure its using the ball emoji and its on the signup message; otherwise continue
	if (reaction._emoji.id !== Ball) return 'CONTINUE';
	if (message.id !== monsterCatcherData.get('signupMessageId')) return 'CONTINUE';

	//get the "guild member" (user relative to server), and add the role to them
	reaction.message.channel.guild.members.fetch(user.id)
		.then(guildMember=> {
			//give user role base on matched emoji
			guildMember.roles.add(monsterCatcherData.get('playerRoleId'))
				.then(e=> {
					log({module: 'role manager'},'GRANTED ',user.username.toUpperCase(),' RESEARCHERS LICENCE')

					guildMember.send(INTROTEXT);
				})
				.catch(e=>log({module: 'role manager', error: new Error('maybe failed to give '+user.username+'role')}));
			})
		.catch(d => log({module: 'role manager', error: new Error('failed to get guild member')}));

});

new Module('lozpekamon leave', 'unreact', {CHANNEL: '553806751808487434'}, function (message,user,reaction) {

	//make sure its using the ball emoji and its on the signup message; otherwise continue
	if (reaction._emoji.id !== Ball) return 'CONTINUE';
	if (message.id !== monsterCatcherData.get('signupMessageId')) return 'CONTINUE';

	//get the "guild member" (user relative to server), and add the role to them
	reaction.message.channel.guild.members.fetch(user.id)
		.then(guildMember=> {
			//give user role base on matched emoji
			guildMember.roles.remove(monsterCatcherData.get('playerRoleId'))
				.then(e=>console.log('\tremoved',user.username,'role'))
				.catch(e=>console.log('\tmaybe failed to remove',user.username,'role'));
			})
		.catch(d => console.log('failed to get guild member',d));

});


//react with bonk (easter egg)
new Module('pocket monsters use bonk', 'react', {}, function (message,user,reaction) {
    
	let activeMonster = monsterCatcherData.get('activeMonster');
	let mName =  monsterCatcherData.get('activeMonsterName').toUpperCase();
	let mId =  monsterCatcherData.get('activeMonsterId');
	let uName = user.username.toUpperCase();
 
 	//exit if the reaction wasn't to the active monster message
	if (message.id !== activeMonster) return 'CONTINUE';
 
	//exit if the emoji used wasn't the right one
	if (reaction._emoji.id !== '732260254682710099') return 'CONTINUE';
 
 //send text
 send(message, '`'+uName+' bonked the '+mName+' and it ran away!`');
 removeMonsterMessage();
});


//react with bonk (easter egg)
new Module('pocket monsters use wave', 'react', {}, function (message,user,reaction) {
    
	let activeMonster = monsterCatcherData.get('activeMonster');
	let mName =  monsterCatcherData.get('activeMonsterName').toUpperCase();
	let mId =  monsterCatcherData.get('activeMonsterId');
	let uName = user.username.toUpperCase();
 
 	//exit if the reaction wasn't to the active monster message
	if (message.id !== activeMonster) return 'CONTINUE';
 
	//exit if the emoji used wasn't the right one
	if (reaction._emoji.id !== '730426885946867793' && reaction._emoji.id !== '699348602975420526') return 'CONTINUE';
 
 
 let text = uName+' waved at the '+mName+'.';
 
 text += ' ' + random([ '',
					'The '+mName+' waved back.',
          'The '+mName+' blinked.',
          'The '+mName+' did nothing.',
          'The '+mName+' growled.',
				]);
 
 //send text
 send(message, '`'+text+'`');
});


//react with pizza (easter egg)
new Module('pocket monsters use a pizza', 'react', {}, function (message,user,reaction) {
    
	let activeMonster = monsterCatcherData.get('activeMonster');
	let mName =  monsterCatcherData.get('activeMonsterName').toUpperCase();
	let mId =  monsterCatcherData.get('activeMonsterId');
	let uName = user.username.toUpperCase();
 
 	//exit if the reaction wasn't to the active monster message
	if (message.id !== activeMonster) return 'CONTINUE';
 
	//exit if the emoji used wasn't the right one
	if (reaction._emoji.id !== '819262750609506336') return 'CONTINUE';
 
 //randomly let it run away 
 if (Math.random() < 0.25) {
   let text = random([
					uName + ' fed the '+mName+' some pizza.',
          uName + ' gave the '+mName+' a slice of pizza. ',
          uName + ' gave '+mName+' some pizza.',
				]) + ' It took it and ran away!';
    //send text
   send(message, '`'+text+'`');
   removeMonsterMessage();
   return;
 }
 });
 
//react with eyes (easter egg)
new Module('pocket monsters use a pizza', 'react', {}, function (message,user,reaction) {
    
	let activeMonster = monsterCatcherData.get('activeMonster');
	let mName =  monsterCatcherData.get('activeMonsterName').toUpperCase();
	let mId =  monsterCatcherData.get('activeMonsterId');
	let uName = user.username.toUpperCase();
 
 	//exit if the reaction wasn't to the active monster message
	if (message.id !== activeMonster) return 'CONTINUE';
 
	//exit if the emoji used wasn't the right one
	if (reaction._emoji.id !== '699349098867720367') return 'CONTINUE';
 
       let text = random([
					uName + ' looked at the '+mName+'.',
          uName + ' stared at the '+mName+'.',
          uName + ' eyed the '+mName+'.',
          uName + ' noticed the '+mName+'.',
				]);
 
 
 //randomly let it run away 
 if (Math.random() < 0.25) {
    text += ' ' + mName+' ran away scared!';
    //send text
   send(message, '`'+text+'`'); 
   removeMonsterMessage();
   return;
 }
 
 
 //pick the text to say
 				text += ' ' +random([
					mName + ' stared back.',
          mName + ' looked back.',
          mName + ' looked back. MENACINGLY.',
          mName + ' is now confused!',
				]);
 
   //send text
   send(message, '`'+text+'`');
});

 
//react with gun (easter egg)
new Module('pocket monsters use a gun', 'react', {}, function (message,user,reaction) {
    
	let activeMonster = monsterCatcherData.get('activeMonster');
	let mName =  monsterCatcherData.get('activeMonsterName').toUpperCase();
	let mId =  monsterCatcherData.get('activeMonsterId');
	let uName = user.username.toUpperCase();
 
 	//exit if the reaction wasn't to the active monster message
	if (message.id !== activeMonster) return 'CONTINUE';
 
	//exit if the emoji used wasn't the right one
	if (reaction._emoji.id !== '733346213117820958') return 'CONTINUE';
 
       let text = uName+' fired a gun at the '+mName+'. The gun missed, but the loud noise scared off the lozpekamon.';
 
 
 //randomly tell a long story
 if (Math.random() < 0.02) {
    text = uName+' fired a gun at the'+mName+'. The bullet struck '+mName+' in the abdomen, and it began to bleed out. It attempted to crawl away, but the injury was too great. Other Lozpekamon trainers jumped in and tried to stop the bleeding. It was too injured to treat on-site, so they rushed it to the closest Lozpekamon center, where it was taken in by the doctors who attempted to save it. The trainers waited while the doctors performed emergency surgery. After 11 long hours, a doctor entered the waiting room with a solemn look on his face. "We did everything we could, but the injuries were too great. The '+mName+'+ passed away. I\'m very sorry for your loss." The doctor broke down into tears. "Whoever did this is the real monster."';
 }
 
   //send text
   send(message, '`'+text+'`');
   removeMonsterMessage();
});

//react with lozpekaball
new Module('pocket monsters use monster ball', 'react', {}, function (message,user,reaction) {

	let activeMonster = monsterCatcherData.get('activeMonster');
	let mName =  monsterCatcherData.get('activeMonsterName').toUpperCase();
	let mId =  monsterCatcherData.get('activeMonsterId');
	let uName = user.username.toUpperCase();

	//exit if the reaction wasn't to the active monster message
	if (message.id !== activeMonster) return 'CONTINUE';

	//exit if the emoji used wasn't the right one
	if (reaction._emoji.id !== Ball && reaction._emoji.id !== NBall ) {

		//remove the reaction
		reaction._emoji.reaction.remove(message.user)
			.then(e=>log({module: 'monster-catcher'},'reaction removed: ',reaction._emoji.name,'['+reaction._emoji.id+']','by',user.username))
			.catch(e=>log({module: 'monster-catcher', error: new Error('failed reaction removal '+reaction._emoji.name+' ['+reaction._emoji.id+'] by'+user.username)}));

		return;
	}



	//get the "guild member" (user relative to server)
	reaction.message.channel.guild.members.fetch(user.id).then(guildMember=> {

		let isNitroBooster = guildMember.roles.cache.some(role => role.name === 'Nitro Booster');
		let NBallModifier = (reaction._emoji.id == NBall && isNitroBooster) ? 0.1 : 0;
		console.log('NBALL',user.username,reaction._emoji.id == NBall,isNitroBooster,NBallModifier);

		//some text that might be used in the message generation
		let ball = reaction._emoji.id == NBall ? 'NITROBALL' : 'LOZPEKABALL';
		let runaway = random(['ran off', 'got away', 'fled', 'turned and ran', 'left', 'ran away','walked away', 'walked off', 'bounced']);
		let grunt = random(['Team PixelJoint grunt', 'PixelPalace grunt', 'PixelDailies grunt']);
		//let NBallModifier = 0;

		//too difficult (extra auto lose)
		let difficulty = getRarity(mId);
		console.log('chance to miss',difficulty,'/',(rarestRarity+1), '=', (difficulty/(rarestRarity+1))*0.5)
		if (Math.random()+NBallModifier < (difficulty/(rarestRarity+1))*0.5) {

			let text;

			//chance to keep the monster there
			if (Math.random() < 0.5) {

				text = random([
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

				text = random([
					mName+' '+random(['dodged','evaded','ducked under'])+' '+uName+'\'s '+ball+' and '+runaway+'!',
					uName+' thew a '+ball+' but missed, and the '+mName+' '+runaway+'!',
					uName+'\'s '+ball+' missed the '+mName+' and it '+runaway+'!',
				]);
			}

			send(message, ' <:Lozpekaball_Missed:837769252852465794> ` '+text+' `');
		}


		// chance to miss
		else if (Math.random()+NBallModifier < 0.7) {
			console.log('missed');

			//create text variable, will be filled based on outcome
			let text;

			//sometimes don't remove the monster
			if (Math.random() < 0.6) {
				text = random([
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

				text = random([
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
			send(message, '<:Lozpekaball_Missed:837769252852465794> ` '+text+' `');

		}

		//catch
		else {
			console.log(user.id, 'caught');

			//reset the monster
			removeMonsterMessage(true);

			let ballEmoji = ball=='NITROBALL'? '<:Nitroball:837768668061368340>' : '<:Lozpekaball:837768503623811184>';

			//check if monster was chipped
			if (monsterCatcherData.get('activeChipped') == true)  //if it was a chipped monster
				send(message, ballEmoji+' ` ' + uName + ' recaught the released '+mName+'! `');
			 else //normal catch
				send(message, ballEmoji+' ` ' + uName + ' caught the wild '+mName+'! `');

			//a path where the new data should be saved
			let monsterPath = 'players.'+user.id+'.'+monsterCatcherData.get('activeMonsterId');

			//create monster if not existant
			if (!monsterCatcherData.has(monsterPath))
				monsterCatcherData.set(monsterPath, 1);
			//increment
			else monsterCatcherData.set(monsterPath, monsterCatcherData.get(monsterPath) + 1);
		}
	}).catch(d => console.log('failed to get guild member',d));
});

//help screen (default)
new Module('monster-catcher', 'message', {filter: new RegExp('^'+CMD+'( help| h)?$','i'), channel: CHANNEL}, function (message, user) {
	send(message,INTROTEXT);
});

//show players score (monsters caught and number)
new Module('monster-catcher dex', 'message', {filter: new RegExp('^'+CMD+' (dex|d)$'), channel: CHANNEL}, function (message, user) {

	if (!monsterCatcherData.has('players.'+user.id) || Object.keys(monsterCatcherData.get('players.'+user.id)).length == 0) return send(message, '` '+user.username.toUpperCase() +'\'s DEX IS EMPTY! `')
	let playerData = monsterCatcherData.get('players.'+user.id);
	let statText = '( ' + Object.keys(playerData).length + ' UNIQUE | ' + Object.values(playerData).reduce((a,b) => a + b) + ' TOTAL )'

	let monsters = monsterCatcherData.get('monsters');

	let dexText = '';
	let dexDisplayCount = 0;

	//send total
	send(message, '` '+user.username.toUpperCase() +'\'s DEX: '+statText+'`');

	//loop through all sending each
	for ( const [monsterId, monster] of Object.entries(monsters)) {
		if (monsterCatcherData.has('players.'+user.id+'.'+monsterId)) {
			dexDisplayCount++;
			dexText += monsters[monsterId].emoji + small(monsterCatcherData.get('players.'+user.id+'.'+monsterId)) + ' ';
			if (dexDisplayCount > 15) {
				send(message, dexText);
				dexText = '';
				dexDisplayCount = 0;
			}  
		}
	}
  //if there's a half finished line, send that now
  if (dexText.length > 0) send(message, dexText);
	
});

//show info on specific monster (if they have caught it)
new Module('monster-catcher dex', 'message', {filter: new RegExp('^'+CMD+' (dex|d) \\d+$'), channel: CHANNEL}, function (message, user) {

	let args = message.content.split(' ');
	//let monsterId = String(args[2]).replace(/^0+/g,'');
	let monsterId = String(args[2]);

	//make sure monster exists and player has it
	if (!monsterCatcherData.has('monsters.'+monsterId)) return send(message, '` LOZPEKAMON DOES NOT EXIST `');
	if (!monsterCatcherData.has('players.'+user.id+'.'+monsterId)) return send(message, '` LOZPEKAMON NOT FOUND IN DEX `');

	let monster = monsterCatcherData.get('monsters.'+monsterId);

	let players = monsterCatcherData.get('players');

	//convert to array
	let topResearcher = Object.entries(players)
		.map(p => {
			if (!p[1][monsterId]) return;
			console.log(p[0],p[1][monsterId])
			return {
				id: p[0],
				total: p[1][monsterId],
			};
		})
		.filter(o => typeof o !== 'undefined')
		.reduce((a,b) => a.total > b.total ? a : b);

	//fetch top user
	client.users.fetch(topResearcher.id)
		.then((user) => {
   
      let R = getRarity(monsterId);
   
			send(message, '**#'+monsterId+': '+monster.name+'**');
      
      //habitat (if released is more than 1)
			if (monster.habitat && monster.released > 1) send(message, '` Habitat: '+monster.habitat.toUpperCase()+' `');
			else send(message, '` Habitat: UNKNOWN `');
      
      //type (if released is 2 times their rarity)
			if (monster.type && monster.released > R*2) send(message, '` Type: '+monster.type.toUpperCase()+' `');
			else send(message, '` Type: UNKNOWN `');
      
      //description (if released is 3 times their rarity)
			if (monster.description && monster.released > R*3) send(message, '` '+monster.description+' ('+(monster.released||0)+' released). `');
			else send(message, '` More research is needed ('+(monster.released||0)+' released). `');

      //rarity (if released is 4 times their rarity)
			if (monster.released > R*4) send(message, '` Rarity: '+R+' `');
			else send(message, '` Rarity: UNKNOWN `');
      
      //send
			send(message, monster.emoji);
			send(message, '` Designer: '+monster.artist.toUpperCase()+' \n Top Researcher: '+user.username.toUpperCase()+' ('+topResearcher.total+' owned) `');
		});
		
	checkForNeededResearchInfo(monsterId); 
});

//release a monster
new Module('monster-catcher release', 'message', {filter: new RegExp('^'+CMD+' release \\d+$'), channel: CHANNEL}, function (message, user) {

	let args = message.content.split(' ');
	//let monsterId = String(args[2]).replace(/0/g,'');
  	let monsterId = String(args[2]);

	//make sure monster exists and player has it
	if (!monsterCatcherData.has('monsters.'+monsterId)) return send(message, '` LOZPEKAMON NOT FOUND `');
	if (!monsterCatcherData.has('players.'+user.id+'.'+monsterId)) return send(message, '` LOZPEKAMON NOT FOUND `');

	//if theres already an active monster, make it run away
	runAway();

	let monster = monsterCatcherData.get('monsters.'+monsterId);

	//decrement players's monster count
	let monsterPath = 'players.'+user.id+'.'+monsterId;
	monsterCatcherData.set(monsterPath, monsterCatcherData.get(monsterPath) -1);
	if (monsterCatcherData.get(monsterPath) == 0) monsterCatcherData.del(monsterPath);

	//send monster message
	send(message,'` '+user.username+' chipped and released a '+monster.name+'. `');

	console.log('SPAWNING MONSTER ',monster.name);

	// TEMP PATCH TO PREVENT THEM FROM BEING RELEASED TO OTHER PLAYERS SINCE ITS BROKEN
			//increase the released monsters count
	let monsterReleasedPath = 'monsters.'+monsterId+'.released';
	if (!monsterCatcherData.has(monsterReleasedPath)) monsterCatcherData.set(monsterReleasedPath, 1);
	else monsterCatcherData.set(monsterReleasedPath, monsterCatcherData.get(monsterReleasedPath) + 1);
	return;


	//send the monster
	message.channel.send(monster.emoji).then(monsterMessage => {
		monsterCatcherData.set('activeMonster',monsterMessage.id);
		monsterCatcherData.set('activeMonsterName',monster.name);
		monsterCatcherData.set('activeMonsterId',monsterId);
		monsterCatcherData.set('activeMonsterChannel',CHANNEL);
		monsterCatcherData.set('activeChipped',true);

		//they run away 5-15 seconds later
		runawayTimer = setTimeout(()=>{
			//hide monster
			removeMonsterMessage();

			let text = random([
				'The released '+monster.name+' scampered off.',
				'The released '+monster.name+' ran off.',
				'The released '+monster.name+' went happily on it\'s way.',
			]);

			//send message
			send(message, '` '+text+' `');

			//increase the released monsters count
			let monsterReleasedPath = 'monsters.'+monsterId+'.released';
			if (!monsterCatcherData.has(monsterReleasedPath)) monsterCatcherData.set(monsterReleasedPath, 1);
			else monsterCatcherData.set(monsterReleasedPath, monsterCatcherData.get(monsterReleasedPath) + 1);
			
			checkForNeededResearchInfo(monsterId);

		}, (5+Math.random()*10)*5000);
	});
});

function checkForNeededResearchInfo (monsterId) {
	
	let numberReleased = monsterCatcherData.get('monsters.'+monsterId+'.released');
	let R = getRarity(monsterId);
	let monster = monsterCatcherData.get('monsters.'+monsterId);
	
	if (numberReleased >= R*2-1 && !monster.habitat) alertAdmin('monster'+monsterId+'needs a habitat!', true);
	if (numberReleased >= R*3-1 && !monster.description) alertAdmin('monster'+monsterId+'needs a description!', true);
}


//show high score list
new Module('monster-catcher researchers', 'message', {filter: new RegExp('^'+CMD+' (researchers|r)$','i'), channel: CHANNEL}, function (message, user) {

	let players = monsterCatcherData.get('players');

	//convert to array
	players = Object.entries(players);

	players = players.map(p => {
		if (Object.keys(p[1]).length == 0 ||  Object.values(p[1]).length == 0) return;
		return {
			id: p[0],
			unique: Object.keys(p[1]).length,
			total: Object.values(p[1]).reduce((a,b) => a + b),
		};
	});

	//sort players first by uniques, then by total
	players.sort((a,b) => b.unique - a.unique || b.total - a.total);

	//limit array size
	players = players.slice(0,10);

	//start fetching all users
	let userFetch = [];
	players.forEach(p => userFetch.push(client.users.fetch(p.id)));

	let text = '';

	//when fetch is done on all users
	Promise.all(userFetch).then(e => {
		//loop through all players
		e.forEach((user,i) => {
			let player = players.find(p => p.id == user.id);
			text+= '\n ['+(i+1)+'] '+ user.username.toUpperCase() + '  ('+player.unique+'|'+player.total+')';
		});

		//send
		send(message,'``` TOP LOZPEKAMON RESEARCHERS: '+text+' ```');
	})
	.catch(console.warn);
});

//give a monster
new Module('monster-catcher give', 'message', {filter: new RegExp('^'+CMD+' +give +<@!?\\d+> +\\d+','i'), channel: CHANNEL}, function (message,user) {
	console.log('GIVE',message.content);

	let args = message.content.split(/ +/g);

	let givingUserId = user.id;
	let targetUserId = args[2].replace(/[^0-9]/gi, '');
	let giveMonsterId = args[3];

	let giverMonsterPath = 'players.'+givingUserId+'.'+giveMonsterId;
	let getterMonsterPath = 'players.'+targetUserId+'.'+giveMonsterId;

	//make sure player isnt giving to self
	if (givingUserId == targetUserId) return react(message,'x_');

	//make sure monster exists
	if (!monsterCatcherData.has('monsters.'+giveMonsterId)) return react(message,'x_');

	//make sure player has that monster to offer
	if (!monsterCatcherData.has(giverMonsterPath)) return react(message,'x_');


	//decrement giver's monster count
	monsterCatcherData.set(giverMonsterPath, monsterCatcherData.get(giverMonsterPath) -1);
	if (monsterCatcherData.get(giverMonsterPath) == 0) monsterCatcherData.del(giverMonsterPath);

	//increment getters's monster count
	if (!monsterCatcherData.has(getterMonsterPath))monsterCatcherData.set(getterMonsterPath, 1);
	else monsterCatcherData.set(getterMonsterPath, monsterCatcherData.get(getterMonsterPath) + 1);

	//success indicator
	react(message,'check')

	console.log(givingUserId,'gave',targetUserId,giveMonsterId)
});


//ADMIN dex - full list
new Module('monster-catcher dex', 'message', {filter: new RegExp('^'+CMD+' (admindex|ad)$'), permissions: 'ADMINISTRATOR'}, function (message, user) {
	let monsters = monsterCatcherData.get('monsters');
  let dexText = '';
  let dexDisplayCount = 0;
//loop through all monsters
	for ( const [monsterId, monster] of Object.entries(monsters)) {

       dexDisplayCount++;
       dexText += monsters[monsterId].emoji + small(monsterId || 0, 3) + ' ';
       
      if (dexDisplayCount > 15) {
          send(message, dexText);
          dexText = '';
          dexDisplayCount = 0;
      }
	}
  
  //if there's a half finished line, send that now
  if (dexText.length > 0) send(message, dexText);
	
});

//ADMIN dex
new Module('monster-catcher dex', 'message', {filter: new RegExp('^'+CMD+' (admindex|ad) \\d+$'), permissions: 'ADMINISTRATOR'}, function (message, user) {

	let args = message.content.split(' ');
	///let monsterId = String(args[2]).replace(/^0+/g,'');
  let monsterId = String(args[2]);

	//make sure monster exists and player has it
	if (!monsterCatcherData.has('monsters.'+monsterId)) return send(message, '` LOZPEKAMON NOT FOUND `');

	let monster = monsterCatcherData.get('monsters.'+monsterId);

	let players = monsterCatcherData.get('players');

	//convert to array
	let topResearcher = Object.entries(players)
		.map(p => {
			if (!p[1][monsterId]) return;
			console.log(p[0],p[1][monsterId])
			return {
				id: p[0],
				total: p[1][monsterId],
			};
		})
		.filter(o => typeof o !== 'undefined')
		.reduce((a,b) => a.total > b.total ? a : b);

	//fetch top user
	client.users.fetch(topResearcher.id)
		.then((user) => {
   
      let R = getRarity(monsterId);
   
			send(message, '**#'+monsterId+': '+monster.name+'**');
			if (monster.description) send(message, '` '+monster.description+' ('+(monster.released||0)+' released). `');
			  else send(message, '` More research is needed ('+(monster.released||0)+' released). `');
			if (monster.habitat) send(message, '` Habitat: '+monster.habitat.toUpperCase()+' `');
			  else send(message, '` Habitat: UNKNOWN `');
 			if (monster.type) send(message, '` Type: '+monster.type.toUpperCase()+' `');
			  else send(message, '` Type: UNKNOWN `');
			send(message, '` Rarity: '+R+' `');
      
      //send
			send(message, monster.emoji);
			send(message, '` Designer: '+monster.artist.toUpperCase()+' \n Top Researcher: '+user.username.toUpperCase()+' ('+topResearcher.total+' owned) `');
		});
});


//ADMIN - spawn monster (maybe)
new Module('monster-catcher spawn', 'message', {filter: new RegExp('^'+CMD+' (spawn|s)$','i'), permissions: 'ADMINISTRATOR'}, function (message, user) {
	log('admin spawn by ',user.username);
	spawn();
});

//ADMIN - set description [monsterId, description]
new Module('monster-catcher set description', 'message', {filter: new RegExp('^'+CMD+' (setdescription|setdesc|sd) \\d+ .+$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {

	let args = message.content.split(/ +/g);

	let monsterId = args[2];
	let newDescription = args.splice(3).join(' ').trim();

	//make sure monster exists
	if (!monsterCatcherData.has('monsters.'+monsterId)) return react(message,'x_');

	monsterCatcherData.set('monsters.'+monsterId+'.description', newDescription);

	react(message,'check:728735875109748748');
});

//ADMIN - set habitat [monsterId, habitat]
new Module('monster-catcher set habitat', 'message', {filter: new RegExp('^'+CMD+' (sethabitat|sethab|sh) \\d+ .+$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {

	let args = message.content.split(/ +/g);

	let monsterId = args[2];
	let newHabitat = args.splice(3).join(' ').trim();


	//make sure monster exists
	if (!monsterCatcherData.has('monsters.'+monsterId)) return react(message,'x_');

	//make sure habitat exists
	if (!habitats.includes(newHabitat)) return react(message,'x_');

	//success
	monsterCatcherData.set('monsters.'+monsterId+'.habitat', newHabitat);
	react(message,'check:728735875109748748');
});


//ADMIN - set type [monsterId, type]
new Module('monster-catcher set type', 'message', {filter: new RegExp('^'+CMD+' (settype|st) \\d+ .+$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {

	let args = message.content.split(/ +/g);

	let monsterId = args[2];
	let newType = args.splice(3).join(' ').trim();


	//make sure monster exists
	if (!monsterCatcherData.has('monsters.'+monsterId)) return react(message,'x_');

	//make sure habitat exists
	if (!types.includes(newType)) return react(message,'x_');

	//success
	monsterCatcherData.set('monsters.'+monsterId+'.type', newType);
	react(message,'check:728735875109748748');
});

//ADMIN - update emoji [monsterId, description]
new Module('monster-catcher update emoji', 'message', {filter: new RegExp('^'+CMD+' (updateemoji|emoji|ue) \\d+ +<:\\d+_[a-z]+:\\d+>$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {

	let args = message.content.split(/ +/g);

	let monsterId = args[2];
	let newEmoji = args.splice(3).join(' ').trim();

	console.log('updating emoji',monsterId,newEmoji)

	//make sure monster exists
	if (!monsterCatcherData.has('monsters.'+monsterId)) return react(message,'x_');

	//success
	monsterCatcherData.set('monsters.'+monsterId+'.emoji', newEmoji);
	react(message,'check:728735875109748748');
});

//ADMIN - set cooldown   [cooldownMinutes]
new Module('monster-catcher set cooldown', 'message', {filter: new RegExp('^'+CMD+' (setcooldown|setcool|sc) \\d+$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {

	let args = message.content.split(/ +/g);

	let newCooldown = args[2];

	monsterCatcherData.set('cooldown', parseInt(newCooldown));

	react(message,'check:728735875109748748');
});

//ADMIN - add monster   [monsterEmoji, artistName]
new Module('monster-catcher set cooldown', 'message', {filter: new RegExp('^'+CMD+' (addmonster|addmon|am) +<:\\d+_[a-z]+:\\d+> +.+$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {


	let monsterEmoji = message.content.split(/ +/g)[2];

	let data = monsterEmoji.split(':');
	let emojiId = data[2].replace('>','');
	let monsterId = data[1].split('_')[0];
	let monsterName = data[1].split('_')[1];
	let artist = message.content.split(/ +/g)[3];

	console.log('emojiId', emojiId);
	console.log('monsterId', monsterId);
	console.log('monsterName', monsterName);
	console.log('artist', artist);

  if (!emojiId || !monsterId || !monsterName || !artist) return react(message,'x_:730425937656545300');

	//save new monster
	monsterCatcherData.set('monsters.'+monsterId, {
		"name": monsterName.toUpperCase(),
		"emoji": monsterEmoji,
		"artist": artist,
	});
 
 
    react(message,'check:728735875109748748');
});


//ADMIN - help
new Module('monster-catcher set cooldown', 'message', {filter: new RegExp('^'+CMD+' (admin|a)$','i'), permissions: 'ADMINISTRATOR'}, function (message,user) {

	send(message, `
\`!admin|a\` - this page
\`!spawn|s\` - spawn a monster
\`!setdescription|setdesc|sd\` - change/set a monsters description
\`!sethabitat|sethab|sh # HABITATNAME\` - change/set a monsters habitat (${habitats.join(', ')})
\`!settype|st # TYPENAME\` - change/set a monsters type (${types.join(', ')})
\`!setcooldown|setcool|sc\` - change the spawn rate
\`!addmonster|addmon|am EMOJI authorname\` - add a monster
\`!admindex|ad #\` - show admin version of dex
	`);
	
	
});

//some functiony things

//returns a random item from an array
function random(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function small(number, digits = 2) {
	const tiny = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];

	number = String(number)
		.split('')
		.map(n => tiny[n])
		.join('');
   
   if (number.length == 1) number = '⁰' + number;
   if (digits == 3 && number.length == 2) number = '⁰' + number;

	return number;
}

