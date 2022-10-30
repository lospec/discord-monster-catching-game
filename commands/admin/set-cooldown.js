import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'set-cooldown',
	description: 'Set the new cooldown time between monster spawns',
	default_member_permissions: "0",
	options: [{
		name: 'cooldown',
		type: ApplicationCommandOptionType.Integer,
		description: 'The number of minutes to wait between monster spawns',
		required: true 
	}]
}

export const execute = async function (interaction) {
	try {
		let cooldown = interaction.options.getInteger('cooldown');
		MonsterGameConfig.set('cooldown', cooldown);
		await interaction.reply({content: 'Set cooldown to '+cooldown+' minutes', ephemeral: true });
	} catch (err) {
		console.log('Failed to set cooldown:',err);
		return interaction.reply({content: 'Failed to set coolrdown: \n ```'+err+'```', ephemeral: true });
	}
}