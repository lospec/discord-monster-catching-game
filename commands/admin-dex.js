import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../monsters.js';
import { getMonsterDescription, listAllMonsters } from '../utilities/monster-info.js';

export const config = {
	name: 'admin-dex', 
	description: 'look up all information about a monster',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: "0",
	options: [{
		name: 'monster',
		type: ApplicationCommandOptionType.String,
		description: 'the name or id of the monster you want to look up (leave blank to list all)',
		autocomplete: true
	}]
};

export const execute = async function (interaction) {
	let monsterId = interaction.options.getString('monster');
	let monster = MonsterStore.get(monsterId||'');
	if (!monster) return listAllMonsters(interaction);
	let dexText = await getMonsterDescription(monsterId);
	await interaction.reply({content: dexText, ephemeral: true });
	
}