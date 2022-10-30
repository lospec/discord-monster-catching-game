import spawn from '../../utilities/spawn.js';
import pickRandom from '../../utilities/pick-random.js';
import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig } from '../../bot.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'spawn-monster',
	description: 'spawn a lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'channel',
		type: ApplicationCommandOptionType.String,
		description: 'The channel ID to spawn the monster in',
		required: false 
	},
	{
		name: 'monster',
		type: ApplicationCommandOptionType.String,
		description: 'The ID number of the lozpekamon to spawn',
		required: false,
		autocomplete: true
	}
	]
}

export const execute = async function(interaction) {
    let spawnId = interaction.options.getString('monster') ?? pickRandom();
	let channelId = interaction.options.getString('channel') ?? MonsterGameConfig.get('channel');
    //pick a random monster
    spawn(spawnId, channelId);
	await interaction.reply({content: 'Spawned monster with ID ' + spawnId + ' in channel ' + channelId, ephemeral: true});
}