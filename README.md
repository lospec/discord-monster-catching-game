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

#### Goals:

- remove old lospecbot code (bot_LEGACY.js and game_LEGACY.js)
- upgrade to discord.js version 14
- separate config data, monster data and user data into separate json files
- remove Lozpekamon specific wording and code
- separate functions/commands into different files
- ~~impliment real discord commands~~
- ~~add new monster command, with image upload (popup?)~~
- automatically mangage emojis / emoji servers
- individual monster owning system
- monster level up system
- monster battle system
- additional data storage options (database)
- high scores list(s) with top trainers/monsters
- economy plugin
