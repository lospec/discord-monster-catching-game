import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';
import { MovesStore } from '../../moves.js';
import {capitalizeFirstLetter} from '../../utilities/capitalize-first-letter.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'add-move-pool',
	description: 'add a new move pool to the game',
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: ApplicationCommandOptionType.String,
		description: 'The name of the new move pool',
		required: true 
	}]
}

export const execute = async function (interaction) {
	try {

		let name = interaction.options.getString('name');
		
		let movePools = Object.keys(MovesStore.get() || {});
		if (movePools.includes(name)) throw 'Move pool '+name+' already exists';
		
		MovesStore.set(capitalizeFirstLetter(name), {});
		await interaction.reply({content: 'added  '+name+' to move pools', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add move pool: \n ```'+err+'```', ephemeral: true });
	}
}