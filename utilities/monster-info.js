import { MonsterGameConfig, MonsterGameClient } from '../bot.js';
import { MonsterStore } from '../monsters.js';
import smallNumber from '../utilities/small-number.js';
import getRarity from "../utilities/calculate-rarity.js";
import { PlayerStore } from '../players.js';

export async function getMonsterDescription (monsterId, user=null) {
	try {
		let monster = MonsterStore.get(monsterId||'');
		let topResearcher = await getTopResearcher(monsterId);
		let R = getRarity(monsterId);
		let released = PlayerStore.get(user.id)[monsterId]['released']

		console.log(R);
		
		//habitat (if released is more than 1)
		let habitat = monster.habitat && (released > 1 || !user) ? monster.habitat.toUpperCase() : 'UNKNOWN';
		
		//type (if released is 2 times their rarity)
		let type = monster.type && (released >= R*2 || !user) ? monster.type.toUpperCase() : 'UNKNOWN';
	
		//description (if released is 3 times their rarity)
		let description = monster.description && (released >= R*3 || !user) ? monster.description : 'More research is needed ('+(released||0)+' released).';

		//rarity (if released is 4 times their rarity)
		let rarity = R && (released >= R*4 || !user) ? R : 'UNKNOWN';

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
			 dexText += '` Top Researcher: '+topResearcher.username.toUpperCase()+' ('+PlayerStore.get(topResearcher.id)[monsterId]['released'] +' released)`';
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

export function personalDex (interaction) {
	let user = interaction.user;
	let dexText = '';
	if (!PlayerStore.has(user.id) || Object.keys(PlayerStore.get(user.id)).length == 0) return interaction.reply({content: '` '+user.username.toUpperCase() +'\'s DEX IS EMPTY! `', ephemeral: true});
	let playerData = PlayerStore.get(user.id);
	console.log(Object.values(playerData));
	let statText = '( ' + Object.keys(playerData).length + ' UNIQUE | ' + Object.values(playerData).map(a => a.owned).reduce((a,b) => a + b) + ' TOTAL )'

	let dexDisplayCount = 0;

	//send total
	dexText += '` '+user.username.toUpperCase() +'\'s DEX: '+statText+'`\n';

	//loop through all sending each
	for ( const monsterId of Object.keys(PlayerStore.get(user.id))) {
		console.log(monsterId);
		dexDisplayCount++;
		dexText += MonsterStore.get(monsterId).emoji + small(PlayerStore.get(user.id)[monsterId].owned) + ' ';
		if (dexDisplayCount > 15) {
			dexText += '\n';
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
			if (!p[1][monsterId]['released']) return;
			//console.log(p[0],p[1][monsterId])
			return {
				id: p[0],
				total: p[1][monsterId]['released'],
			};
		})
		.filter(o => typeof o !== 'undefined');
	
	if (topResearcher.length == 0) return false;
	
	topResearcher = topResearcher.reduce((a,b) => a.total > b.total ? a : b, 0);

	let guild = await MonsterGameClient.guilds.fetch(MonsterGameConfig.get('serverGuildId'));
	let guildMember = await guild.members.fetch(topResearcher.id);
	return guildMember.user;
}

function small(number, digits = 2) {
	const tiny = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];

	number = String(number)
		.split('')
		.map(n => tiny[n])
		.join('');
   
   if (number.length == 1) number = '⁰' + number;
   if (digits == 3 && number.length == 2) number = '⁰' + number;

	return number;
}