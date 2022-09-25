import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig, MonsterGameClient } from '../bot.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'set-monster-emoji',
	description: 'set/update the emoji of a lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of the species',
		required: true 
	},
	{
		name: 'sprite',
		type: ApplicationCommandOptionType.Attachment,
		description: 'The image of this monster to be turned into an emoji. Will be shown at 64x64 in chat, 24x24 in dex.',
		required: true 
	},
	]
}

export const execute = async function (interaction) {
	try {
		let id = interaction.options.getInteger('id');
		let sprite = interaction.options.getAttachment('sprite');

		let monster = MonsterGameConfig.get('monsters.'+id)
			if (!monster) throw 'A monster with ID '+id+' does not exist.';

		let guild = await MonsterGameClient.guilds.fetch(MonsterGameConfig.get('emojiServerId'));
		let newEmojiName = id+'_'+monster.name.replace(/\s/g,'');
		let newEmoji = await guild.emojis.create({ attachment: sprite.url, name:  newEmojiName});
		let emojiText = '<:'+newEmojiName+':'+newEmoji.id+'>';

		MonsterGameConfig.set('monsters.'+id+'.emoji',emojiText);
		await interaction.reply({content: 'Set new emoji for monster '+id+': '+emojiText, ephemeral: true });
	} catch (err) {
		console.log('Failed to set monster emoji:',err);
		return interaction.reply({content: 'Failed to set monster emoji: \n ```'+err+'```', ephemeral: true });
	}
}