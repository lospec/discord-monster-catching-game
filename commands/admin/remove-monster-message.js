import removeMonsterMessage from '../../utilities/remove-message.js';
import { ApplicationCommandOptionType } from 'discordjs14';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'remove-monster-message',
	description: 'Remove the active lozpekamon',
	default_member_permissions: "0",
	options: [
    {
		name: 'caught',
		type: ApplicationCommandOptionType.Boolean,
		description: 'Whether the monster was caught or not',
        default: false,
		required: false 
	}
	]
}
export const execute = async function(interaction) {
    removeMonsterMessage(interaction.options.getBoolean('caught'));
	await interaction.reply({ content: 'Removed the active monster message', epheremal: true });
}