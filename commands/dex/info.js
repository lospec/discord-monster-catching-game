import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../../monsters.js';
import { getMonsterDescription, personalDex } from '../../utilities/monster-info.js';

export const config = {
	name: 'info',
	type: ApplicationCommandOptionType.Subcommand,
	description: 'look up infomation about a lozpekamon',
	options: [
		{
			name: 'monster',
			type: ApplicationCommandOptionType.String,
			description: 'The monster to look up',
			autocomplete: true
		}
	]
};

export const execute = async function (interaction) {
	let id = interaction.options.getString('monster');

	if (!id) {
		return personalDex(interaction);	
	}
	
	let monster = MonsterStore.get(id);
	if (!monster) return interaction.reply({content: 'You haven\t found monster #'+id, ephemeral: true });

	let dexText = await getMonsterDescription(id, interaction.user);
	await interaction.reply({content: dexText, ephemeral: true });
}