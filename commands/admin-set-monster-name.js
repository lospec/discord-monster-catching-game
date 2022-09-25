import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../bot.js';
import { MonsterStore } from '../monsters.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'set-monster-name',
	description: 'change/set the name of a lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of the species',
		required: true 
	},
	{
		name: 'name',
		type: ApplicationCommandOptionType.String,
		description: 'The new name for this species.',
		required: true 
	}
	]
}

export const execute = async function (interaction) {
	try {
		let id = interaction.options.getInteger('id');
		let name = interaction.options.getString('name');
		if (! MonsterStore.get(id.toString())) throw 'A monster with ID '+id+' does not exist.';
		
		MonsterStore.set(id+'.name', name);
		await interaction.reply({content: 'Set name of monster '+id+' to '+name, ephemeral: true });
	} catch (err) {
		console.log('Failed to set name:',err);
		return interaction.reply({content: 'Failed to set name: \n ```'+err+'```', ephemeral: true });
	}
}