import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../../monsters.js';
import { PlayerStore } from '../../players.js';
import { getMonsterDescription, personalDex } from '../../utilities/monster-info.js';
import { Monster } from '../../utilities/mon.js';

export const config = {
	name: 'transfer',
	type: ApplicationCommandOptionType.Subcommand,
	description: 'transfer a monster to your pc or team',
	options: [
		{
			name: 'monster',
			type: ApplicationCommandOptionType.String,
			description: 'the name or id of the monster you want to transfer',
			required: true,
			autocomplete: true
		},
		{
			name: 'name',
			type: ApplicationCommandOptionType.String,
			description: 'the name to give to the monster you want to transfer',
			required: true
		},
		{
			name: 'location',
			type: ApplicationCommandOptionType.String,
			description: 'the location you want to transfer the monster to',
			required: true,
			choices: [
				{
					name: 'pc',
					value: 'pc'
				},
				{
					name: 'team',
					value: 'team'
				}
			]
		}
	]
};

export const execute = async function (interaction) {

	let monster = interaction.options.getString('monster');
	let location = interaction.options.getString('location');
	let name = interaction.options.getString('name');
	let monsterPath = interaction.user.id+'.dex.'+monster+'.owned';

	if (!MonsterStore.has(monster)) return interaction.reply({content: "`Lozpekamon doesn't exist`", ephemeral: true});
	if (!PlayerStore.has(monsterPath)) return interaction.reply({content: "`You don't own that lozpekamon`", ephemeral: true});

	PlayerStore.set(monsterPath, PlayerStore.get(monsterPath) -1);
	if (PlayerStore.get(monsterPath) == 0) PlayerStore.del(monsterPath);
	if (location == 'pc' && PlayerStore.get(interaction.user.id+'.pc').length == 16) {
		return interaction.reply({content: "`Your PC is full`", ephemeral: true});
	}
	if (location == 'team' && PlayerStore.get(interaction.user.id+'.team').length == 4) {
		return interaction.reply({content: "`Your team is full`", ephemeral: true});
	}
	let destinationPath = interaction.user.id+'.'+location;
	if (!PlayerStore.has(destinationPath)) PlayerStore.set(destinationPath, [monster]);
	else PlayerStore.set(destinationPath, [...PlayerStore.get(destinationPath), Monster.rollNew(monster, name).toString()]);

	return await interaction.reply({content: "`" + name.toUpperCase() + "` transferred to " + location, ephemeral: true});
}