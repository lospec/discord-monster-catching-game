require('dotenv').config();
const Discord = require('discord.js');
const Store = require('data-store');


////////////////////////////////////////////////////////////////////////////////
//////// CONFIG ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


const store = new Store({ path: __dirname+'/monster-catching-game-data.json' });
const CONFIG = Object.assign({},store.get('config'));
CONFIG.botName = 'Discord Bot';
CONFIG.emojiTimeout = 500;
CONFIG.debug = false;
CONFIG.logIncomingEvents = true;
CONFIG.exitOnUncaughtException = true;
global.CONFIG = CONFIG;
global.CONFIGSTORE = store;

//make sure token is configured
if (!process.env.DISCORD_BOT_TOKEN) {
	console.log('Your discord bot token was not found.');
	process.exit();
}

//const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: [
	Discord.GatewayIntentBits.Guilds, 
	Discord.GatewayIntentBits.GuildBans,
	Discord.GatewayIntentBits.GuildEmojisAndStickers, 
	Discord.GatewayIntentBits.GuildVoiceStates,
	Discord.GatewayIntentBits.GuildMessages,
	Discord.GatewayIntentBits.GuildMessageReactions,
	Discord.GatewayIntentBits.GuildMembers,
	Discord.GatewayIntentBits.DirectMessages,
	Discord.GatewayIntentBits.DirectMessageReactions
]});

////////////////////////////////////////////////////////////////////////////////
//////// MODULE PROCESSING /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var modules = [];

//when an event is triggered, search for a matching module and execute it
function checkModules (event, user, message, reaction, data) {

	//ignore events from bots
	if (user.bot) return;

		console.log(event[0], message?message.channel.type:'');

    //print messages to console
    if (CONFIG.logIncomingEvents) {
		if (event.includes('voice')) console.log('  ',event[0].toUpperCase(),user.username+':');
		else if (event == 'dm') console.log('  ',event[0].toUpperCase(),user.username+':',reaction?reaction._emoji.name:message.content);
		else if (message && message?.channel) console.log('  ',event[0].toUpperCase(),'#'+message.channel.name.toUpperCase(),user.username+':',reaction?reaction._emoji.name:message.content);
    }

	//loop through each defined module until a matching one is found
	let foundMatch = false;
    for (var i = 0; i < modules.length; i++) {
        let module = modules[i];

		//continue searching if any of the properties don't match
		if (module.command) continue; //should be a slash command instead
		if (module.event != event) continue; //wrong event
		if (module.channel != '*' && module.channel != message.channel.id && !module.channel.includes(message.channel.id)) continue; //wrong channel
		if (module.permissions && message.member && !message.member.permissions.has(module.permissions)) continue; //message was from a bot
		if (module.pingBot && [...message.mentions.users.values()].filter(u => u.id == client.user.id) < 1) continue; //bot was not pinged
		if (message && !module.filter.test(message.content)) continue; //filter mismatch

		//rate limit
		if (module.rateLimit) {
			let lastTriggered = store.get('lastTriggered.'+module.name);

			//if the command is over the rate limit
			if (new Date() - new Date(lastTriggered) < 1000*60*module.rateLimit) {
				if (typeof module.overLimit == 'function') module.overLimit(message, user);
				continue;
			}
		}

		console.log('\t\tEXECUTING MODULE:',module.name)

		//execute module
		try {
			var result = module.func(message, user, reaction || data);
		} catch (err) {
			console.error(err);
			console.log({module: module.name, error:err});
			continue;
		}

		if (result == 'CONTINUE') continue;
		store.set('lastTriggered.'+module.name, new Date());
		if (!module.stopOnMatch) continue;

		//stop looking for bot matches
		foundMatch = true;
        break;

    }

    //bot was pinged but not matched, react confused
    if (!foundMatch && event=='message' && [...message.mentions.users.values()].filter(u => u.id == client.user.id) > 0) {
    	react(message,'hmm');
    }
}

function checkSlashCommand(user, command, interaction) {
	//console.log(interaction);

	console.log('s', command);

	//loop through modules to find matching command
	for (let i = 0; i < modules.length; i++) {
		let module = modules[i];
	
		//command doesn't match, continue searching
		if (!module.command) continue; 
		if (module.command.name !== command) continue; 

		//check if commands
		if (module.channel != '*' && module.channel != interaction.channelId && !module.channel.includes(interaction.channelId)) continue; //wrong channel

		//execute module
		try {
			module.func(interaction, user);
		} catch (err) {
			console.log({module: module.name, error:err});
			continue;
		}
	}
}

class Module {
	constructor (name, event, options, func) {
		//defaults
		this.name = name;
	    this.event = event;
	    this.options = {};
		this.func = func;

		//make sure required fields are there
		if (!this.func || !this.event || !this.name) return console.log({module: this.name||'unnamed module', error: new Error('module missing required fields')});

	    //allow user to pass just a regex filter for options
	    if (options instanceof RegExp) options = {filter: options};

	    //set options
	    this.filter = options.filter || /.+/;
	    this.channel = options.channel || '*';
	    this.pingBot = options.pingBot || false;
	    this.stopOnMatch = options.stopOnMatch || true;
	    this.rateLimit = options.rateLimit;
	    this.overLimit = options.overLimit || function () {};
	    this.permissions = options.permissions;
		this.command = options.command ? {
			name: options.command,
			type: options.commandType || 1,
			description: options.description || this.command,
			options: options.options || [] 
		} : false;
	    

		//show warning if the g flag was added to filter, as it breaks .test()
		if (this.filter.flags.includes('g'))
			console.log('\x1b[1m'+'\x1b[37m'+'['+this.name.toUpperCase()+']'+'\x1b[33m'+' WARNING:'+'\x1b[0m','including g flag on filters will most likely break things');

		//keep track of when it was last triggered for ratelimits
		this.lastTriggered = store.get('lastTriggered.'+this.name);
		if (!this.lastTriggered) store.set('lastTriggered.'+this.name, new Date());



	    //add to array of modules
	    modules.push(this);
	}
}

////////////////////////////////////////////////////////////////////////////////
//////// EVENT LISTENERS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


client.on('messageCreate', (message) => {
	if (message.channel.type == 'dm')
		checkModules('dm',message.author, message);
	else
		checkModules('message',message.author, message);
});

client.on('messageReactionAdd', (reaction, user) => {
	console.log('react')
	checkModules('react',user,reaction.message,reaction);
});

client.on('messageReactionRemove', (reaction, user) => {
	checkModules('unreact',user,reaction.message,reaction);
});


////////////////////////////////////////////////////////////////////////////////
//////// UTILITY FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//send a message
function send(message, text) {
	message.channel.send(String(text));
}

//add a reaction to a message
function react(message, emojiArray) {

	//if not an array, convert to an array
	if (!Array.isArray(emojiArray)) emojiArray = [emojiArray];

	//loop through each option, adding the emoji
	for (var i = 0; i < emojiArray.length; i++) {

		console.log('\tsending emoji',(i+1)+'/'+emojiArray.length,emojiArray[i]);

		let e = emojiArray[i];

		//do a timeout since doing them all at once makes them display in a random order
		setTimeout(()=>{

			//try to find an emoji with a matching name on the server
			var matchedEmoji = message.guild.emojis.cache.find(emoji => emoji.name === e);

			//emoji was found, send that
			if (matchedEmoji)
				message.react(matchedEmoji)
					.catch(()=>{throw new Error('failed to react with '+matchedEmoji)});

			//emoji not found (assume generic emoji and try to send)
			else
				message.react(e)
					.catch(()=>{throw new Error('emoji '+matchedEmoji+' not found')});

		}, CONFIG.emojiTimeout*i);
	}
}

//send a single emoji message
function sendEmoji(message, emojiName) {
	var emoji = message.guild.emojis.find(emoji => emoji.name === emojiName);
	message.channel.send('<:'+emoji.name+':'+emoji.id+'>')
		.catch(console.warn);
}

//pick a random item from an array
function pickRandom (optionsArray) {
	return optionsArray[Math.floor(Math.random()*optionsArray.length)];
}

//make functions global so they're available in included modules
global.Module = Module;
global.send = send;
global.react = react;
global.sendEmoji = sendEmoji;
global.pickRandom = pickRandom;
global.client = client;
global.Discord = Discord;

////////////////////////////////////////////////////////////////////////////////
//////// STARTUP ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

require('./game_LEGACY.js');

//when bot is connected
client.once('ready', () => {
	//store guild info
	global.guild = client.guilds.cache.first();

	console.log('connected to',guild.name,'as',client.user.username);
});


//log bot in
client.login(process.env.DISCORD_BOT_TOKEN);

/*global log, guild*/