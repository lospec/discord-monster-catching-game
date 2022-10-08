import { PlayerStore } from "../players.js";
import { Monster } from "../utilities/mon.js";
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';

export const config = {
	name: 'pc', 
	description: 'look up infomation about your saved lozpekamon',
	type: ApplicationCommandType.ChatInput,
	options: [
		
	]
};

export const execute = async function (interaction) {

	let pc = await PlayerStore.get(interaction.user.id+'.pc');
    let pcString = '';
    pcString += '```\nYour PC:\n';
    pc.forEach((mon, index) => {
        console.log(mon);
        let monster = Monster.fromString(mon);
        console.log(monster);
        pcString += monster.output() + '\n';
    });
    pcString += '```';
	await interaction.reply({content: pcString, ephemeral: true });
}