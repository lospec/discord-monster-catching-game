import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import runAway from "../utilities/runaway.js";
import { MonsterGameConfig } from "../bot.js";
import spawn from '../utilities/spawn.js';
import { MonsterStore } from '../monsters.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'release-monster',
	description: 'release a lozpekamon',
	options: [{
		name: 'monster-id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of the lozpekamon to release',
		required: true 
	}]
}

export const execute = async function(interaction) {
  	let monsterId = interaction.options.getInteger('monster-id');

	//make sure monster exists and player has it
	if (!MonsterStore.has(monsterId.toString())) {
        return await interaction.reply({content: '` LOZPEKAMON NOT FOUND `', ephemeral: true });
    } 
	if (!MonsterGameConfig.has('players.'+interaction.user.id+'.'+monsterId)) {
        return await interaction.reply({content: '` LOZPEKAMON NOT FOUND `', ephemeral: true });
    } 

	//if theres already an active monster, make it run away
	runAway();

	let monster = MonsterStore.get(monsterId.toString());

	//decrement players's monster count
	let monsterPath = 'players.'+interaction.user.id+'.'+monsterId;
	MonsterGameConfig.set(monsterPath, MonsterGameConfig.get(monsterPath) -1);
	if (MonsterGameConfig.get(monsterPath) == 0) MonsterGameConfig.del(monsterPath);

	//send monster message
	interaction.reply('` '+interaction.user.username+' chipped and released a '+monster.name+'. `');

	console.log('SPAWNING MONSTER ',monster.name);

	// TEMP PATCH TO PREVENT THEM FROM BEING RELEASED TO OTHER PLAYERS SINCE ITS BROKEN
			//increase the released monsters count
	// let monsterReleasedPath = 'monsters.'+monsterId+'.released';
	// if (!MonsterGameConfig.has(monsterReleasedPath)) MonsterGameConfig.set(monsterReleasedPath, 1);
	// else MonsterGameConfig.set(monsterReleasedPath, MonsterGameConfig.get(monsterReleasedPath) + 1);
	// return;

    spawn(monsterId, interaction.channelId, true);
}