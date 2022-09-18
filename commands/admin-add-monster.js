module.exports.config = {
	type: ApplicationCommandType.ChatInput,
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
		name: 'description',
		type: ApplicationCommandOptionType.String,
		description: 'The dex entry that talks about this species.',
	}
	]
}

module.exports.execute = async function (interaction) {
	
	try {
		let name = interaction.options.getString('name');
		let id = interaction.options.getInteger('id');
		let artist = interaction.options.getString('artist');
		let sprite = interaction.options.getAttachment('sprite');
		let habitat = interaction.options.getString('habitat');
		let description = interaction.options.getString('description');

		//add new emoji of monster
		let guild = await MonsterGameClient.guilds.fetch(MonsterGameConfig.get('serverGuildId'))
		let newEmojiName = id+'_'+name.replace(/\s/g,'');
		let newEmoji = await guild.emojis.create({ attachment: sprite.url, name:  newEmojiName});

		//monster data
		let newMonster = {
			name: name,
			artist: artist,
			emoji: '<'+newEmojiName+':'+newEmoji.id+'>'
		}
		if (habitat) newMonster.habitat = habitat;
		if (description) newMonster.description = description;

		MonsterGameConfig.set('monsters.'+id, newMonster);

		//success
		await interaction.reply({content: 'Monster successfully added.', ephemeral: true });

	} catch (err) {
		console.log('Failed to add monster:',err);
		return interaction.reply({content: 'Failed to add monster: \n ```'+err+'```', ephemeral: true });
	}
}