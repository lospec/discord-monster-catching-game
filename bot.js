#!/usr/bin/env node
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ApplicationCommandType, ApplicationCommandOptionType } = require('discordjs14');
const Store = require('data-store');
	global.MonsterGameConfig = new Store({ path: __dirname+'/monster-catching-game-data.json' });
const REST = require('@discordjs/rest').REST,
	  rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
	  DiscordRestRoutes = require('discord-api-types/v9').Routes;
const glob = require('glob');

//globals
global.ApplicationCommandType = ApplicationCommandType;
global.ApplicationCommandOptionType = ApplicationCommandOptionType;

//load commands
const COMMANDS = {};
glob.sync('./commands/*.js').map(command => require(command))
	.forEach(command => COMMANDS[command.config.name] = command);

//load reactions
const REACTIONS = {};
glob.sync('./reactions/*.js').map(reaction => require(reaction))
	.forEach(reaction => REACTIONS[reaction.config.emojiId] = reaction);

console.log('starting bot...')
if (!process.env.DISCORD_BOT_TOKEN) {console.log('Your discord bot token was not found.'); process.exit();}

// Create a new client instance
let client = new Client({ 
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,  GatewayIntentBits.GuildMessageReactions],
		partials: [Partials.Message, Partials.Channel, Partials.Reaction],
	});
	global.MonsterGameClient = client;
// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('bot logged in');

	//extract just the config for each command
	let commandList = Object.values(COMMANDS).map(command => command.config);

	//load commands
	rest.put(DiscordRestRoutes.applicationGuildCommands(client.user.id,MonsterGameConfig.get('serverGuildId')), {body: commandList} )
		.then(e => console.log('loaded '+commandList.length+' commands'))
		.catch(err=> console.error('failed to load commands:',err))
});

//chat command was triggered
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log('command run:',interaction.commandName)

	if (COMMANDS[interaction.commandName])
		COMMANDS[interaction.commandName].execute(interaction);
	else console.log('command not recognized:', interaction.commandName)
});

//user reacted to a message
client.on('messageReactionAdd', async (reaction, user) => {
	try {
		if (reaction.partial) await reaction.fetch();
		console.log('reaction on message',reaction.message.id, 'with',reaction._emoji?.id);

		if (!reaction.message.channelId == MonsterGameConfig.get('serverGuildId')) return;
		if (!REACTIONS[reaction._emoji.id]) return;

		//emoji matched, execute reaction function
		REACTIONS[reaction._emoji.id].execute(reaction, user);
	} 
	catch (error) {console.error('Something went wrong when fetching the reaction:', error);}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

