import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';
import { MovesStore } from '../../moves.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'add-move-effect',
	description: 'add an effect to a move',
	default_member_permissions: "0",
	options: [{
		name: 'move',
		type: ApplicationCommandOptionType.String,
		description: 'Which move this effect should be applied to',
		required: true,
		autocomplete: true
	},{
		name: 'damage-type',
		type: ApplicationCommandOptionType.String,
		description: 'The type of damage this move inflicts',
		choices: MonsterGameConfig.get('damageTypes').map(h => ({name:h,value:h}))
	},{
		name: 'target',
		type: ApplicationCommandOptionType.String,
		description: 'The target of this move\'s effect (defaults to opponent)',
		choices: ['Opponent','Self','World'].map(h => ({name:h,value:h}))
	},{
		name: 'affects',
		type: ApplicationCommandOptionType.String,
		description: 'The stat, weakness or resistance which this move affects (defaults to health)',
		choices: getAffectsList()
	},{
		name: 'amount',
		type: ApplicationCommandOptionType.Integer,
		description: 'The amount of this move buffs or debuffs each time it\'s inflicted (defaults to 0)',
		min_value: -9,
		max_value: 9
	},{
		name: 'duration',
		type: ApplicationCommandOptionType.Integer,
		description: 'The number of turns this turns effect is repeated (defaults to 1)',
		min_value: 1,
		max_value: 9
	},{
		name: 'speed',
		type: ApplicationCommandOptionType.Integer,
		description: 'The speed of this effect, which determines order',
		min_value: 1,
		max_value: 9,
	},
]}

export const execute = async function (interaction) {
	try {
		let move = interaction.options.getString('move');
		if (!MovesStore.get(move)) throw 'Move named '+move+' doesn\'t exist!';
		
		//success
		MovesStore.union(move+'.effects', {
			damageType: interaction.options.getString('damage-type'),
			target: interaction.options.getString('target') || 'Opponent',
			affects: interaction.options.getString('affects') || 'health',
			amount: interaction.options.getInteger('amount') || 0, 
			duration: interaction.options.getInteger('duration') || 1,
			speed: interaction.options.getInteger('speed') || 1,
		});
		await interaction.reply({content: 'added effect to the move `'+move+'`. If you wish, add another effect with `/admin add-move-effect`. ', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add move effect: \n ```'+err+'```', ephemeral: true });
	}
}

function getAffectsList () {
	let stats = MonsterGameConfig.get('stats').map(t=> ({name:t+' Stat', value:'stat:'+t}));
	let resist = MonsterGameConfig.get('damageTypes').map(t=> ({name:t+' Resistance', value:'resist:'+t}));
	let weak = MonsterGameConfig.get('damageTypes').map(t=> ({name:t+' Weakness', value:'weak:'+t}));

	return [].concat(stats,resist, weak);
}