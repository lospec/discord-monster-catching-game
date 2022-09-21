import { MonsterGameConfig, rarestRarity, MonsterGameClient } from "../bot.js";
import randomElement from "../utilities/random-element.js";
import getRarity from "../utilities/calculate-rarity.js";
import removeMonsterMessage from "../utilities/remove-message.js";

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

export const config = {
	emojiId: MonsterGameConfig.get('ballEmojiId')
}

export const execute = function (reaction, user) {
    //If it is on the signup message, add the role
    if (MonsterGameConfig.get('signupMessageId') == reaction.message.id) {
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
    else {
        //exit if the reaction wasn't to the active monster message
        let activeMonster = MonsterGameConfig.get('activeMonster');
        if (reaction.message.id !== activeMonster) return 'CONTINUE';
        let mName =  MonsterGameConfig.get('activeMonsterName').toUpperCase();
        let mId =  MonsterGameConfig.get('activeMonsterId');
        let uName = user.username.toUpperCase();

        
        const Ball = MonsterGameConfig.get('ballEmojiId');
        const NBall = MonsterGameConfig.get('nitroBallEmojiId');

        //exit if the emoji used wasn't the right one
        // if (reaction._emoji.id !== Ball && reaction._emoji.id !== NBall ) {

        // 	//remove the reaction
        // 	reaction._emoji.reaction.remove(message.user)
        // 		.then(e=>log({module: 'monster-catcher'},'reaction removed: ',reaction._emoji.name,'['+reaction._emoji.id+']','by',user.username))
        // 		.catch(e=>log({module: 'monster-catcher', error: new Error('failed reaction removal '+reaction._emoji.name+' ['+reaction._emoji.id+'] by'+user.username)}));

        // 	return;
        // }



        //get the "guild member" (user relative to server)
        reaction.message.channel.guild.members.fetch(user.id).then(guildMember=> {

            let isNitroBooster = guildMember.roles.cache.some(role => role.name === 'Nitro Booster');
            let NBallModifier = (reaction._emoji.id == NBall && isNitroBooster) ? 0.1 : 0;
            console.log('NBALL',user.username,reaction._emoji.id == NBall,isNitroBooster,NBallModifier);

            //some text that might be used in the message generation
            let ball = reaction._emoji.id == NBall ? 'NITROBALL' : 'LOZPEKABALL';
            let runaway = randomElement(['ran off', 'got away', 'fled', 'turned and ran', 'left', 'ran away','walked away', 'walked off', 'bounced']);
            let grunt = randomElement(['Team PixelJoint grunt', 'PixelPalace grunt', 'PixelDailies grunt']);
            //let NBallModifier = 0;

            //too difficult (extra auto lose)
            let difficulty = getRarity(mId);
            console.log('chance to miss',difficulty,'/',(rarestRarity+1), '=', (difficulty/(rarestRarity+1))*0.5)
            if (Math.random()+NBallModifier < (difficulty/(rarestRarity+1))*0.5) {

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

                reaction.message.channel.send(/*message,*/'<:Lozpekaball_Missed:837769252852465794> ` '+text+' `');
            }


            // chance to miss
            else if (Math.random()+NBallModifier < 0.7) {
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

                let ballEmoji = ball=='NITROBALL'? NBall : Ball;

                //check if monster was chipped
                if (MonsterGameConfig.get('activeChipped') == true)  //if it was a chipped monster
                    reaction.message.channel.send(ballEmoji+' ` ' + uName + ' recaught the released '+mName+'! `');
                else //normal catch
                    reaction.message.channel.send(ballEmoji+' ` ' + uName + ' caught the wild '+mName+'! `');

                //a path where the new data should be saved
                let monsterPath = 'players.'+user.id+'.'+MonsterGameConfig.get('activeMonsterId');

                //create monster if not existant
                if (!MonsterGameConfig.has(monsterPath))
                MonsterGameConfig.set(monsterPath, 1);
                //increment
                else MonsterGameConfig.set(monsterPath, MonsterGameConfig.get(monsterPath) + 1);
            }
        }).catch(d => console.log('failed to get guild member',d));
    }
}