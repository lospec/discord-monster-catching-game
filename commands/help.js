import fs from 'fs';
import { ApplicationCommandType } from 'discordjs14';

export const config = {
	name: 'lozpekamon-help', 
	description: 'learn how to play the lozpekamon monster catching game',
	type: ApplicationCommandType.ChatInput
};

const INTROTEXT = '```' + fs.readFileSync('_text/help.txt', 'utf8') + '```';

export const execute = async function (interaction) {
	await interaction.reply({content: INTROTEXT, ephemeral: true });
}	