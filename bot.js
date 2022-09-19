#!/usr/bin/env node
import pickRandom from './utilities/pick-random.js';
import getRarity from './utilities/calculate-rarity.js';
import spawn from './utilities/spawn.js';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discordjs14';
import { REST } from '@discordjs/rest';
import { Routes as DiscordRestRoutes } from 'discord-api-types/v9';
import { Store } from 'data-store';
import glob from 'glob';

dotenv.config();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

export const MonsterGameConfig = new Store({ path: './monster-catching-game-data.json' });
export const monsters = MonsterGameConfig.get('monsters');
export const rarestRarity = Math.max(...Object.keys(MonsterGameConfig.get('monsters')).map(id=>getRarity(id)));
export var runawayTimer;
var Pool = [];
Object.keys(monsters).forEach (id => {
	let numberOfSpawns = Math.pow(2, rarestRarity - getRarity(id));
	let lastNumber = Pool.length == 0? 0 : Pool[Pool.length-1].weight;
	Pool.push({id: id, rarity: getRarity(id), spawns: numberOfSpawns, weight: lastNumber + numberOfSpawns});
});
export { 
	Pool as Pool
}

//load commands
let COMMANDS = {};
glob.sync('./commands/*.js').forEach(command =>
	import(command).then(obj => {
		COMMANDS[obj.config.name] = obj;
	})
	
);


//load reactions
let REACTIONS = {};
glob.sync('./reactions/*.js').forEach(reaction =>
	import(reaction).then(obj => {
		REACTIONS[obj.config.emojiId] = obj;
	})
);

console.log('starting bot...')
if (!process.env.DISCORD_BOT_TOKEN) {console.log('Your discord bot token was not found.'); process.exit();}

// Create a new client instance
let client = new Client({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,  GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
export const MonsterGameClient = client;
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
	console.log('command run:', interaction.commandName)

	if (COMMANDS[interaction.commandName])
		COMMANDS[interaction.commandName].execute(interaction);
	else console.log('command not recognized:', interaction.commandName)
});

//user reacted to a message
client.on('messageReactionAdd', async (reaction, user) => {
	try {
		if (reaction.partial) await reaction.fetch();
		console.log('reaction on message',reaction.message.id, 'with',reaction._emoji?.id ?? reaction.emoji.name);
		
		if (!reaction.message.channelId == MonsterGameConfig.get('channel')) return;
		if (!REACTIONS[reaction._emoji?.id ?? reaction.emoji.name]) return;

		//emoji matched, execute reaction function
		REACTIONS[reaction._emoji?.id ?? reaction.emoji.name].execute(reaction, user);
	} 
	catch (error) {console.error('Something went wrong when fetching the reaction:', error);}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

//randomly spawn a monster
setInterval(spawn, 1000 * 60 * MonsterGameConfig.get('cooldown') * (1.25 - Math.random()*0.5), monsters[pickRandom()], MonsterGameConfig.get('channel'));

