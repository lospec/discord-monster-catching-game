import { ApplicationCommandOptionType } from 'discordjs14';
import { MonsterGameConfig, MonsterGameClient } from '../../bot.js';
import { MovesStore } from '../../moves.js';

if (!MonsterGameConfig.get("emoji-servers")) MonsterGameConfig.set("emoji-servers", {});

export const config = {
	type: ApplicationCommandOptionType.Subcommand,
	name: 'add-emoji-server',
	description: 'add a new server, which the bot can add emojis to',
	default_member_permissions: "0",
	options: [{
		name: 'server-id',
		type: ApplicationCommandOptionType.String,
		description: 'The server id of the new emoji server',
		min_length: 18,
		max_length: 18,
		required: true 
	},
]}

export const execute = async function (interaction) {
	try {
		let emojiServerId = interaction.options.getString('server-id');
		if (!/^[0-9]+$/.test(emojiServerId)) throw 'Invalid characters in ID: it should be an 18 character long string of numbers.';

		let guild = await MonsterGameClient.guilds.fetch(emojiServerId);
		let numberOfEmojis = Array.from(await (await guild.emojis.fetch()).keys()).length;
		MonsterGameConfig.set("emoji-servers."+emojiServerId, {
			id: emojiServerId,
			name: guild.name,
			full: numberOfEmojis>=50,
		});

		await interaction.reply({content: 'added emoji server `'+guild.name+'` (`'+emojiServerId+'`), which has '+(50-numberOfEmojis)+' emoji slots left.', ephemeral: true });
	} catch (err) {
		console.log('Failed to set description:',err);
		return interaction.reply({content: 'Failed to add emoji server: \n ```'+err+'```', ephemeral: true });
	}
}