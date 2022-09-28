import { MonsterGameConfig, MonsterGameClient } from '../bot.js';
import { MonsterStore } from '../monsters.js';
import smallNumber from '../utilities/small-number.js';
import getRarity from "../utilities/calculate-rarity.js";
import { PlayerStore } from '../players.js';

export const getMonsterDescription = async function (monsterId) {
	try {
		let monster = MonsterStore.get(monsterId||'');

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
		return dexText;
	} catch (err) {
		console.log('Failed to get monster:',err);
		return 'Failed to get monster: \n ```'+err+'```';
	}
}

export function listAllMonsters (interaction) {
	let monsters = MonsterStore.get();
  	let dexText = '';
  	let dexDisplayCount = 0;
	//loop through all monsters
	for ( const [monsterId, monster] of Object.entries(monsters)) {

       dexDisplayCount++;
       dexText += monsters[monsterId].emoji + smallNumber(monsterId || 0, 3) + ' ';
       
      if (dexDisplayCount > 15) {
			interaction.reply({content: dexText, ephemeral: true });
          	dexText = '';
          	dexDisplayCount = 0;
      }
	}
  
  	//if there's a half finished line, send that now
  	if (dexText.length > 0) interaction.reply({content: dexText, ephemeral: true });
}

async function getTopResearcher (monsterId) {
	let players = PlayerStore.get();
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