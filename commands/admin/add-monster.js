import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig, MonsterGameClient } from '../../bot.js';
import { MonsterStore } from '../../monsters.js';

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'add-monster',
	description: 'create a new lozpekamon',
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: ApplicationCommandOptionType.String,
		description: 'The name of this species',
		required: true 
	},
	{
		name: 'id',
		type: ApplicationCommandOptionType.Integer,
		description: 'The ID number of this species',
		required: true 
	},
	{
		name: 'artist',
		type: ApplicationCommandOptionType.String,
		description: 'The name of the artist that created this sprite',
		required: true 
	},
	{
		name: 'sprite',
		type: ApplicationCommandOptionType.Attachment,
		description: 'The image of this monster to be turned into an emoji. Will be shown at 64x64 in chat, 24x24 in dex.',
		required: true 
	},
	{
		name: 'habitat',
		type: ApplicationCommandOptionType.String,
		description: 'The main biome where this species is found.',
		choices: MonsterGameConfig.get('habitats').map(h => ({name:h,value:h}))
	},
	{
		name: 'type',
		type: ApplicationCommandOptionType.String,
		description: 'The type of animal this monster is most similar to',
		choices: MonsterGameConfig.get('types').map(t => ({name:t,value:t}))
	},
	{
		name: 'description',
		type: ApplicationCommandOptionType.String,
		description: 'The dex entry that talks about this species.',
	}
	]
}

export const execute = async function (interaction) {
	
	try {
		let name = interaction.options.getString('name');
		let id = String(interaction.options.getInteger('id'));
		let artist = interaction.options.getString('artist');
		let sprite = interaction.options.getAttachment('sprite');
		let habitat = interaction.options.getString('habitat');
		let type = interaction.options.getString('type');
		let description = interaction.options.getString('description');

		if (id > 9999) throw 'ID numbers must be between 1 and 9999';
		if (MonsterStore.get(id)) throw 'A monster with ID '+id+' already exists. Choose a different ID, or modify that monster.';


		let emojiServers = MonsterGameConfig.get('emoji-servers');
		console.log('sss',emojiServers)
		let selectedEmojiServer = Object.keys(emojiServers)
			.map(id => emojiServers[id])
			.find(async server => {
				//add new emoji of monster
				let guild = await MonsterGameClient.guilds.fetch(server.id);
				let numberOfEmojis = Array.from(await (await guild.emojis.fetch()).keys()).length;
				return numberOfEmojis < 50;
			});
		if (!selectedEmojiServer) throw 'Failed to find an empty emoji server. Add emoji servers with /admin add-emoji-server.'
		
		let guild = await MonsterGameClient.guilds.fetch(selectedEmojiServer.id);
		let newEmojiName = id+'_'+name.replace(/\s/g,'');
		let newEmoji = await guild.emojis.create({ attachment: sprite.url, name:  newEmojiName});

		//monster data
		let newMonster = {
			name: name,
			artist: artist,
			emoji: '<:'+newEmojiName+':'+newEmoji.id+'>'
		}
		if (habitat) newMonster.habitat = habitat;
		if (type) newMonster.type = type;
		if (description) newMonster.description = description;

		MonsterStore.set(id, newMonster);

		//success
		await interaction.reply({content: 'Monster **#'+id+' '+name.toUpperCase()+'** successfully added. [emoji server: '+selectedEmojiServer.name+':'+selectedEmojiServer.id+']', ephemeral: true });

	} catch (err) {
		console.log('Failed to add monster:',err);
		return interaction.reply({content: 'Failed to add monster: \n ```'+err+'```', ephemeral: true });
	}
}