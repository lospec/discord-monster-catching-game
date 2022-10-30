import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';
import { MovesStore } from '../../moves.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'add-move',
	description: 'add a new move to the game',
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: ApplicationCommandOptionType.String,
		description: 'The name of the new move',
		required: true 
	},{
		name: 'pool',
		type: ApplicationCommandOptionType.String,
		description: 'The move pool which this move should exist in',
		required: true,
		choices: Object.keys(MovesStore.get()).map(h => ({name:h,value:h}))
	},{
		name: 'damage-type',
		type: ApplicationCommandOptionType.String,
		description: 'The type of damage this move inflicts',
		required: true,
		choices: MonsterGameConfig.get('damageTypes').map(h => ({name:h,value:h}))
	},{
		name: 'unlock-level',
		type: ApplicationCommandOptionType.Integer,
		description: 'The monster level at which this move unlocks',
		required: true,
		min_value: 0,
		max_value: 999
	},{
		name: 'target',
		type: ApplicationCommandOptionType.String,
		description: 'The target of this move\'s effect (defaults to opponent)',
		choices: ['Opponent','Self','Both'].map(h => ({name:h,value:h}))
	},{
		name: 'duration',
		type: ApplicationCommandOptionType.Integer,
		description: 'The number of turns this turns effect is repeated (defaults to 1)',
		min_value: 1,
		max_value: 9
	},{
		name: 'damage',
		type: ApplicationCommandOptionType.Integer,
		description: 'The amount of damage this move causes each time it\'s inflicted (defaults to 0)',
		min_value: 0,
		max_value: 9
	},{
		name: 'speed',
		type: ApplicationCommandOptionType.Integer,
		description: 'The speed of this attack, which determines order (defaults to 1)',
		min_value: 1,
		max_value: 9,
	},{
		name: 'healing',
		type: ApplicationCommandOptionType.Integer,
		description: 'The amount of health this move heals (defaults to 0)',
		min_value: 0,
		max_value: 9
	},
]}

export const execute = async function (interaction) {
	try {
		let name = interaction.options.getString('name');
		let pool = interaction.options.getString('pool');

		if (MovesStore.get(pool+'.'+name)) throw 'Move named '+name+' already exists!';
		

		//success
		MovesStore.set(pool+'.'+name, {
			damageType: interaction.options.getString('damage-type'),
			unlockLevel: interaction.options.getString('unlockLevel'),
			target: interaction.options.getString('target') || 'Opponent',
			duration: interaction.options.getInteger('duration') || 1,
			damage: interaction.options.getInteger('damage') || 0, 
			speed: interaction.options.getInteger('speed') || 1,
			healing: interaction.options.getInteger('healing') || 0,
		});
		await interaction.reply({content: 'added  `'+name+'` move to `'+pool+'` pool', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add move: \n ```'+err+'```', ephemeral: true });
	}
}