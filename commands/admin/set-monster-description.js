import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../../monsters.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'set-monster-description',
	description: 'change/set the description of a lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of the species',
		required: true 
	},
	{
		name: 'description',
		type: ApplicationCommandOptionType.String,
		description: 'The new dex entry that talks about this species.',
		required: true 
	}
	]
}

export const execute = async function (interaction) {
	try {
		let id = interaction.options.getInteger('id');
		let description = interaction.options.getString('description');
		if (! MonsterStore.get(id.toString())) throw 'A monster with ID '+id+' does not exist.';
		
		MonsterStore.set(id+'.description', description);
		await interaction.reply({content: 'Set description of monster '+id+' to '+description, ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to set description: \n ```'+err+'```', ephemeral: true });
	}
}