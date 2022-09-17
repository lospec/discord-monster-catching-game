#!/usr/bin/env node
require('dotenv').config();
const { Client, GatewayIntentBits, ApplicationCommandType } = require('discordjs14');
const Store = require('data-store'),
	  store = new Store({ path: __dirname+'/monster-catching-game-data.json' });
const REST = require('@discordjs/rest').REST,
	  rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
	  DiscordRestRoutes = require('discord-api-types/v9').Routes;
const glob = require('glob');

//globals
global.ApplicationCommandType = ApplicationCommandType;

//load commands
const COMMANDS = {};
glob.sync('./commands/*.js').map(command => require(command))
	.forEach(command => COMMANDS[command.config.name] = command);

console.log('starting bot...')
if (!process.env.DISCORD_BOT_TOKEN) {console.log('Your discord bot token was not found.'); process.exit();}

// Create a new client instance
let client = new Client({ intents: [GatewayIntentBits.Guilds] });
	global.discordMonsterCatchingGamediscordJsClient = client;
// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('bot logged in');

	//extract just the config for each command
	let commandList = Object.values(COMMANDS).map(command => command.config);

	//load commands
	rest.put(DiscordRestRoutes.applicationGuildCommands(client.user.id,store.get('serverGuildId')), {body: commandList} )
		.then(e => console.log('loaded commands'))
		.catch(err=> console.error('failed to load commands:',err))
});


client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log('command run:',interaction.commandName)

	if (COMMANDS[interaction.commandName])
		COMMANDS[interaction.commandName].execute(interaction);
	else console.log('command not recognized:', interaction.commandName)
});
console.log()


// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

