#!/usr/bin/env node
import pickRandom from './utilities/pick-random.js';
import spawn from './utilities/spawn.js';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discordjs14';
import { REST } from '@discordjs/rest';
import { Routes as DiscordRestRoutes } from 'discord-api-types/v9';
import { Store } from 'data-store';
import glob from 'glob';
import { monstersAutocomplete } from './monsters.js';
import { playersAutocomplete } from './players.js';
import { movesAutoComplete } from './moves.js';


dotenv.config();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

export const MonsterGameConfig = new Store({ path: './_data/config.json' });
export const MonsterGameState = new Store({ path: './_data/game-state.json' });
const COMMANDS = {}

//load reactions
let REACTIONS = {};
glob.sync('./reactions/*.js').forEach(reactionFile =>
	import(reactionFile).then(reaction => {
		let name = reactionFile.replace('./reactions/','').replace('.js','');
		let emojiId = MonsterGameConfig.get('reactionEmojis.'+name);
		if (!emojiId) return; 

		REACTIONS[emojiId] = {
			name: name,
			emojiId: emojiId,
			execute: reaction.execute
		};
	})
);
export {REACTIONS as REACTIONS}

console.log('starting bot...')
if (!process.env.DISCORD_BOT_TOKEN) {console.log('Your discord bot token was not found.'); process.exit();}

// Create a new client instance
let client = new Client({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,  GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
export const MonsterGameClient = client;
// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('bot logged in');

	let commandsList = [];
	let commandFileList = glob.sync('./commands/*.js')
	
	for (let commandPath of commandFileList) {

		let command = await import(commandPath);
		commandsList.push(command.config);
		COMMANDS[command.config.name] = command.execute;

		let subcommandsFileList = glob.sync('./commands/'+command.config.name+'/*.js');
		if (subcommandsFileList.length > 0) {
			command.config.options = command.config.options || [];

			for (let subcommandPath of subcommandsFileList) {
				let subcommand = await import(subcommandPath);
				command.config.options.push(subcommand.config);
				COMMANDS[command.config.name+'.'+subcommand.config.name] = subcommand.execute;
			}
		}
		console.log('loaded command',command.config.name,'with',subcommandsFileList.length,'subcommands')
	}
	console.log('done with commands?')

	//load commands
	rest.put(DiscordRestRoutes.applicationGuildCommands(client.user.id,MonsterGameConfig.get('serverGuildId')), {body: commandsList} )
		.then(e => console.log('loaded ',commandsList.length,' commands'))
		.catch(err=> console.error('failed to load commands:',err))
});

//chat command was triggered
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log('command run:', interaction.commandName)

	let command = interaction.commandName;
	let subcommand = interaction.options.getSubcommand(false);
	
	let commandName = command;
	if (subcommand) commandName += '.'+subcommand;
	
	if (!COMMANDS[commandName]) return console.warn('command "'+commandName+'" not found');

	//run the command
	try { COMMANDS[commandName](interaction); }
	catch (e) {console.log('failed to run "'+commandName+'"', e)}
});

//user reacted to a message
client.on('messageReactionAdd', async (reaction, user) => {
	try {
		if (reaction.partial) await reaction.fetch();
		if (!reaction.message.channelId == MonsterGameConfig.get('channel')) return;

		let emoji = reaction._emoji?.id ?? reaction.emoji.name;
		console.log('reaction on message',reaction.message.id, 'with',emoji,!REACTIONS[emoji]?'(not matched)':REACTIONS[emoji].name);

		if (!REACTIONS[emoji]) return;

		//emoji matched, execute reaction function
		REACTIONS[emoji].execute(reaction, user);
	} 
	catch (error) {console.error('Something went wrong when fetching the reaction:', error);}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

//randomly spawn a monster
setInterval(spawn, 1000 * 60 * MonsterGameConfig.get('cooldown') * (1.25 - Math.random()*0.5), pickRandom(), MonsterGameConfig.get("channel"));


//autocomplete for dex 
MonsterGameClient.on('interactionCreate', interaction => {
	if (!interaction.isAutocomplete()) return;
	console.log('autocomplete run:',interaction.commandName)

	const selectedOption = interaction.options.getFocused(true);

	let autocomplete;
	switch (selectedOption.name) {
		case 'monster':
			autocomplete = monstersAutocomplete;
			break;
		case 'player':
			autocomplete = playersAutocomplete;
			break;
		case 'move':
			autocomplete = movesAutoComplete;
			break;
		default:
			return;
	}

	//success - return choices
	interaction.respond(autocomplete.filter(choice => choice.name.toLowerCase().includes(selectedOption.value.toLowerCase())));
});