import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../monsters.js';
import { getMonsterDescription } from '../utilities/monster-info.js';

export const config = {
	name: 'dex', 
	description: 'look up infomation about a lozpekamon',
	type: ApplicationCommandType.ChatInput,
	options: [{
		name: 'monster',
		type: ApplicationCommandOptionType.String,
		description: 'the name or id of the monster you want to look up',
		autocomplete: true
	}]
};

export const execute = async function (interaction) {
	let id = interaction.options.getString('monster');

	let monster = MonsterStore.get(id||'');
	if (!monster) return interaction.reply({content: 'You haven\t found monster #'+id, ephemeral: true });

	let dexText = await getMonsterDescription(id, true);
	await interaction.reply({content: dexText, ephemeral: true });
}	