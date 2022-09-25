import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig, COMMANDS } from '../bot.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'lozpekamon-admin-help',
	description: 'get help configuring the lozpekamon game',
	default_member_permissions: "0",
}

export const execute = async function (interaction) {
	try {
		console.log(Object.values(COMMANDS));

		let commandlist = '** ADMIN COMMANDS **\n\n';
		
		commandlist += Object.values(COMMANDS).filter(c => c.config.default_member_permissions=='0')
			.map(c => '**/'+c.config.name+'** : '+c.config.description).join('\n');

		commandlist+= '\n\n **PLAYER COMMANDS**\n\n'

		commandlist += Object.values(COMMANDS).filter(c => c.config.default_member_permissions!='0')
			.map(c => '**/'+c.config.name+'** : '+c.config.description).join('\n');

		await interaction.reply({content: commandlist, ephemeral: true });
	} catch (err) {
		console.log('Failed to set name:',err);
		return interaction.reply({content: 'Failed to get admin help: \n ```'+err+'```', ephemeral: true });
	}
}