import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig, REACTIONS } from '../bot.js';
import glob from 'glob';

const REACTION_NAMES = glob.sync('./reactions/*.js').map(r => r.replace('./reactions/','').replace('.js','')).map(h => ({name:h,value:h}));
console.log(REACTION_NAMES)
export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'set-reaction-emoji',
	description: 'set the emoji used for specific reactions ',
	default_member_permissions: "0",
	options: [{
		name: 'target-emoji',
		type: ApplicationCommandOptionType.String,
		description: 'Which emoji you would like to set / change',
		choices: REACTION_NAMES,
		required: true 
	},
	{
		name: 'new-emoji',
		type: ApplicationCommandOptionType.String,
		description: 'The new emoji that should trigger this reaction',
		required: true 
	}
	]
}

export const execute = async function (interaction) {
	console.log('oh shit set an emojo',interaction.options.getString('target-emoji'),  interaction.options.getString('new-emoji'))
	try {
		let targetEmoji = interaction.options.getString('target-emoji');
		let newEmoji = interaction.options.getString('new-emoji').trim();

		//if the new emoji is a custom emoji, extract the id from the full emoji tag
		let emojiId = newEmoji.match(/<:.*:(\d+)>/);
		if (emojiId) newEmoji  = emojiId[1];

		MonsterGameConfig.set('reactionEmojis.'+targetEmoji, newEmoji);
		interaction.reply({content: 'Set emoji "'+targetEmoji+'" to "'+newEmoji+'".', ephemeral: true });

		//update the live reactions list so the new emoji is recognized without reboot
		let reactionData = await import('../reactions/'+targetEmoji+'.js');
		REACTIONS[newEmoji] = {
			name: targetEmoji,
			emojiId: newEmoji,
			execute: reactionData.execute
		}
	} catch (err) {
		console.log('Failed to set emoji:',err);
		return interaction.reply({content: 'Failed to set emoji: \n ```'+err+'```', ephemeral: true });
	}
}