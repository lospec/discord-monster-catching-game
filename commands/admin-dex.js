import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig, MonsterGameClient } from '../bot.js';
import { MONSTERS } from '../monsters.js';
import getRarity from "../utilities/calculate-rarity.js";

export const config = {
	name: 'admin-dex', 
	description: 'look up all unlocked information about a monster',
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: "0",
	options: [{
		name: 'monster',
		type: ApplicationCommandOptionType.String,
		description: 'the name or id of the monster you want to look up',
		autocomplete: true
	}]
};

export const execute = async function (interaction) {
	try {
		let monsterId = interaction.options.getString('monster');
		console.log('nmodns',monsterId)
		
		let monster = MONSTERS[monsterId];
		if (!monster) throw 'Monster with id ' +monsterId+' not found.';

		let topResearcher = await getTopResearcher(monsterId);

		let dexText = '';
		dexText += '**#'+ monster.name +': '+monsterId+'**\n';
		dexText += monster.emoji+'\n';
		dexText += '` '+ (monster.description||'description not specified') +'`\n';
		dexText += '` Habitat: '+ (monster.habitat||'not specified') +'`\n';
		dexText += '` Type: '+ (monster.type||'not specified') +'`\n';
		dexText += '` Rarity: '+ getRarity(monsterId) +'`\n';
		dexText += '` Designer: '+ (monster.artist||'artist not specified') +'`\n';
		if (topResearcher)
			dexText += '` Top Researcher: '+ topResearcher.username.toUpperCase()+'#'+topResearcher.discriminator +'`\n';
		
		await interaction.reply({content: dexText, ephemeral: true });
	} catch (err) {
		console.log('Failed to get monster:',err);
		return interaction.reply({content: 'Failed to get monster: \n ```'+err+'```', ephemeral: true });
	}
}

async function getTopResearcher (monsterId) {
	let players = MonsterGameConfig.get('players');

	//convert to array
	let topResearcher = Object.entries(players)
		.map(p => {
			if (!p[1][monsterId]) return;
			console.log(p[0],p[1][monsterId])
			return {
				id: p[0],
				total: p[1][monsterId],
			};
		})
		.filter(o => typeof o !== 'undefined');
	
	if (topResearcher.length == 0) return false;
	
	topResearcher = topResearcher.reduce((a,b) => a.total > b.total ? a : b, 0);

	let guild = await MonsterGameClient.guilds.fetch(MonsterGameConfig.get('serverGuildId'));
	let guildMember = await guild.members.fetch(topResearcher.id);
	return guildMember.user;
}