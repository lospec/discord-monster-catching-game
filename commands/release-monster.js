import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import runAway from "../utilities/runaway.js";
import spawn from '../utilities/spawn.js';
import { MonsterStore } from '../monsters.js';
import { PlayerStore } from '../players.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'release-monster',
	description: 'release a lozpekamon',
	options: [{
		name: 'monster',
		type: ApplicationCommandOptionType.String,
		description: 'The ID number of the lozpekamon to release',
		required: true ,
		autocomplete: true
	}]
}

export const execute = async function(interaction) {
  	let monsterId = interaction.options.getString('monster');

	//make sure monster exists and player has it
	if (!MonsterStore.has(monsterId)) {
        return await interaction.reply({content: '` LOZPEKAMON NOT FOUND `', ephemeral: true });
    }
	console.log("Monster exists");
	if (!PlayerStore.has(interaction.user.id+'.'+monsterId+'.owned')) {
        return await interaction.reply({content: '` LOZPEKAMON NOT FOUND `', ephemeral: true });
    } 

	//if theres already an active monster, make it run away
	runAway();

	let monster = MonsterStore.get(monsterId);

	//decrement players's monster count
	let monsterPath = interaction.user.id+'.'+monsterId+'.owned';
	PlayerStore.set(monsterPath, PlayerStore.get(monsterPath) -1);
	if (PlayerStore.get(monsterPath) == 0) PlayerStore.del(monsterPath);

	//increment monster's release count
	let releasePath = interaction.user.id+'.'+monsterId+'.released';
	if (!PlayerStore.has(releasePath)) PlayerStore.set(releasePath, 0);
	PlayerStore.set(releasePath, PlayerStore.get(releasePath) +1);

	//send monster message
	interaction.reply('` '+interaction.user.username+' chipped and released a '+monster.name+'. `');

	console.log('SPAWNING MONSTER ',monster.name);

    spawn(monsterId, interaction.channelId, interaction.user.id);
}