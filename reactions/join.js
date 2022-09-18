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

module.exports.config = {
	emojiId: MonsterGameConfig.get('ballEmojiId')
}

module.exports.execute = function (reaction, user) {
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
	console.log('The join reaction was triggered');
}