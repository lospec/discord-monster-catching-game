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
		name: 'unlock-level',
		type: ApplicationCommandOptionType.Integer,
		description: 'The monster level at which this move unlocks',
		required: true,
		min_value: 0,
		max_value: 999
	}
]}

export const execute = async function (interaction) {
	try {
		let name = interaction.options.getString('name');
		let pool = interaction.options.getString('pool');

		if (MovesStore.get(pool+'.'+name)) throw 'Move named '+name+' already exists!';
		
		//success
		MovesStore.set(pool+'.'+name, {
			unlockLevel: interaction.options.getString('unlockLevel'),
			effects: []
		});
		await interaction.reply({content: 'added  `'+name+'` move to `'+pool+'` pool.\nNow you must add 1 or more move effects with "/admin add-move-effect". ', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add move: \n ```'+err+'```', ephemeral: true });
	}
}