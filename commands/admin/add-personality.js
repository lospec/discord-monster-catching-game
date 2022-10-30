import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';
import {capitalizeFirstLetter} from '../../utilities/capitalize-first-letter.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'add-personality',
	description: 'add a new personality type to the game',
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: ApplicationCommandOptionType.String,
		description: 'The name of the new personality',
		required: true 
	}]
}

export const execute = async function (interaction) {
	try {

		let name = capitalizeFirstLetter(interaction.options.getString('name'));
		
		let personalities = MonsterGameConfig.get('personalities') || [];
		if (personalities.includes(name)) throw 'Personality '+name+'already exists';
		
		personalities.push(name);
		
		MonsterGameConfig.set('personalities', personalities);
		await interaction.reply({content: 'added  '+name+' to personalities', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add personality: \n ```'+err+'```', ephemeral: true });
	}
}