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

#### Goals:

- remove old lospecbot code (bot_LEGACY.js and game_LEGACY.js)
- upgrade to discord.js version 14
- separate config data, monster data and user data into separate json files
- remove Lozpekamon specific wording and code
- separate functions/commands into different files
- impliment real discord commands
- add new monster command, with image upload (popup?)
- automatically mangage emojis / emoji servers
- individual monster owning system
- monster level up system
- monster battle system
- additional data storage options (database)
- high scores list(s) with top trainers/monsters

#### Commands

To add a command, create a new javascript file in the `./commands` folder. This file should export the following:
- `config` - an object (json) containing the name, description, 