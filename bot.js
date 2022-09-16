#!/usr/bin/env node
require('dotenv').config();
console.log('starting bot...')

const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('bot logged in');
	require('./game.js');
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);