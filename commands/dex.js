import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../bot.js';
import { MONSTERS } from '../monsters.js';

export const config = {
	name: 'dex', 
	description: 'look up infomation about a lozpekamon',
	type: ApplicationCommandType.ChatInput,
	options: [{
		name: 'monster',
		type: ApplicationCommandOptionType.Integer,
		description: 'the name or id of the monster you want to look up'
	}]
};

export const execute = async function (interaction) {
	let id = interaction.options.getInteger('id');

	let monster = MonsterGameConfig.get('monsters.'+id);
	if (!monster) return interaction.reply({content: 'You haven\t found monster #'+id, ephemeral: true });

	await interaction.reply({content: INTROTEXT, ephemeral: true });
}	