import { MonsterGameConfig, MonsterGameClient } from '../bot.js';
import { MonsterStore } from '../monsters.js';
import smallNumber from '../utilities/small-number.js';
import getRarity from "../utilities/calculate-rarity.js";
import { PlayerStore } from '../players.js';

export async function getMonsterDescription (monsterId, admin=false) {
	try {
		let monster = MonsterStore.get(monsterId||'');
		let topResearcher = await getTopResearcher(monsterId);
		let R = getRarity(monsterId);
		
		//habitat (if released is more than 1)
		let habitat = monster.habitat && (monster.released > 1 || admin) ? monster.habitat.toUpperCase() : 'UNKNOWN';
		
		//type (if released is 2 times their rarity)
		let type = monster.type && (monster.released >= R*2 || admin) ? monster.type.toUpperCase() : 'UNKNOWN';
	
		//description (if released is 3 times their rarity)
		let description = monster.description && (monster.released >= R*3 || admin) ? monster.description+' ('+(monster.released||0)+' released).' : 'More research is needed ('+(monster.released||0)+' released).';

		//rarity (if released is 4 times their rarity)
		let rarity = monster.rarity && (monster.released >= R*4 || admin) ? R : 'UNKNOWN';

		let artist = monster.artist ? monster.artist.toUpperCase() : 'UNKNOWN';

		let dexText = '';
		dexText += '**#' + monster.name +': '+monsterId+'**\n';

		dexText += 					monster.emoji	+'\n';
		dexText += '` '				+ description 	+'`\n';
		dexText += '` Habitat: '	+ habitat 		+'`\n';
		dexText += '` Type: '		+ type 			+'`\n';
		dexText += '` Rarity: '		+ rarity 		+'`\n';
		dexText += '` Designer: '	+ artist 		+'`\n';
		if (topResearcher)
			 dexText += '` Top Researcher: '+topResearcher.username.toUpperCase()+' ('+PlayerStore.get(topResearcher.id)[monsterId] +' owned)`';
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
			//console.log(p[0],p[1][monsterId])
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