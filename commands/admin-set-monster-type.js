import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../bot.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'set-monster-type',
	description: 'set/update the type of a lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of the species',
		required: true 
	},
	{
		name: 'type',
		type: ApplicationCommandOptionType.String,
		description: 'The type of animal this monster is most similar to',
		choices: MonsterGameConfig.get('types').map(t => ({name:t,value:t}))
	},
	]
}

export const execute = async function (interaction) {
	try {
		let id = interaction.options.getInteger('id');
		let type = interaction.options.getString('type');
		let monster = MonsterGameConfig.get('monsters.'+id)
			if (!monster) throw 'A monster with ID '+id+' does not exist.';

		MonsterGameConfig.set('monsters.'+id+'.type',type);
		await interaction.reply({content: 'Set new type for monster '+id+': '+type, ephemeral: true });
	} catch (err) {
		console.log('Failed to set monster type:',err);
		return interaction.reply({content: 'Failed to set monster type: \n ```'+err+'```', ephemeral: true });
	}
}