import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../monsters.js';
import { MonsterGameConfig, MonsterGameClient } from '../bot.js';

export const config = {
	type: ApplicationCommandType.ChatInput,
	name: 'add-damage-type',
	description: 'add a new damage type to the game',
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: ApplicationCommandOptionType.String,
		description: 'The name of the new damage type',
		required: true 
	}]
}

export const execute = async function (interaction) {
	try {

		let name = interaction.options.getString('name');
		
		let damageTypes = MonsterGameConfig.get('damageTypes') || [];
		if (damageTypes.includes(name)) throw 'Damage type '+name+'already exists';
		
		damageTypes.push(name);
		
		MonsterGameConfig.set('damageTypes', damageTypes);
		await interaction.reply({content: 'added  '+name+' to damageTypes', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add damage type: \n ```'+err+'```', ephemeral: true });
	}
}