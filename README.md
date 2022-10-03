# discord-monster-catching-game
a discord-based monster catching game engine, used for Lozpekamon on our Discord server

# How to Use

### Requirements

- [install Node.js version 16+](https://nodejs.org/en/)
- [register your bot with discord](https://discordjs.guide/preparations/setting-up-a-bot-application.html)
- [add the bot to your server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

### Installation

- clone this repo to your computer or server
- open command line from the root of the folder and run `npm install`
- create the environment variable `DISCORD_BOT_TOKEN` and set it to your bots token (easiest way to to add it to the .env file)
- run `npm start`

### Development

#### Commands

To add a command, create a new javascript file in the `./commands` folder. This file should export a `config` object and a `execute` function.

##### Command Config

An object (json) containing the information used to create the command.

###### Properties:
- name - the name of the command, that the user will type in
- description - the description text shown to the user when selecting a command
- type - the type of command, stored in the global `ApplicationCommandType`, either `ChatInput`, `User`, or `Message`
- options - an array of additional inputs for your command (optional)

The options also have a type which describe what kind of data the user can submit. [list of ApplicationCommandOptionTypes](https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType)

###### Example:
```
module.exports.config = {
	name: 'my-command',
	description: 'what my command does',
	type: ApplicationCommandType.ChatInput,
	options: [
		name: 'input name',
		type: ApplicationCommandOptionType.String,
		description: 'description of input shown to user',
		required: true 
	]
}
```

**More info:** [Discord API Docs - Application Command Object](https://discord.com/developers/docs/interactions/application-commands#application-command-object)

##### Command Execute Function
A function that should be run when this command is run. Recieves `interaction` as the first argument.

###### Example:
```
module.exports.execute = async function (interaction) {
	await interaction.reply('you used a command! good for you!');
}
```

#### Reactions

To add a reaction, create a new javascript file in the `./reactions` folder. This file should export a `config` object and a `execute` function.

##### Reaction Config

An object (json) containing the information used to listen for the reaction

##### Reaction Execute Function
A function that should be run when this reaction is used. Recieves `reaction` and `user` as arguments.

###### Example:
```
module.exports.execute = function (reaction, user) {
	console.log('the test reaction was triggered');
}
```

###### Properties:
- emojiId - the discord id # for the emoji 

#### Goals:

Main goal is to rewrite the legacy code into the newer version, running on discord.js 14.
- ~~create new discord.js v14 bot~~
- ~~implement real discord commands~~
- ~~implement reaction system~~
- ~~transfer over all old commands~~
- ~~transfer over all old reactions~~
- ~~transfer over wild monster appeared system~~
- ~~separate functions into different files~~
- ~~separate config data, monster data and user data into separate json files~~

commands to add:
- ~~new monster command, with image upload (popup?)~~
- change emoji server 

future goals:
- individual monster owning system
- monster level up system
- monster battle system
- ~~additional data storage options (database)~~
- high scores list(s) with top trainers/monsters
- ~~economy plugin~~
