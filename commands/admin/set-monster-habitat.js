import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';
import { MonsterStore } from '../../monsters.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'set-monster-habitat',
	description: 'change/set the habitat of a lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of the species',
		required: true 
	},
	{
		name: 'habitat',
		type: ApplicationCommandOptionType.String,
		description: 'The main biome where this species is found.',
		choices: MonsterGameConfig.get('habitats').map(h => ({name:h,value:h})),
		required: true 
	}
	]
}

export const execute = async function (interaction) {
	try {
		let id = interaction.options.getInteger('id');
		let habitat = interaction.options.getString('habitat');
		if (! MonsterStore.get(id.toString())) throw 'A monster with ID '+id+' does not exist.';

		MonsterStore.set(id+'.habitat', habitat);
		await interaction.reply({content: 'Set habitat of monster '+id+' to '+habitat, ephemeral: true });
	} catch (err) {
		console.log('Failed to set habitat:',err);
		return interaction.reply({content: 'Failed to set habitat: \n ```'+err+'```', ephemeral: true });
	}
}