import { ApplicationCommandType, ApplicationCommandOptionType } from 'discordjs14';
import { MonsterStore } from '../monsters.js';
import { PlayerStore } from '../players.js';

export const config = {
	name: 'give', 
	description: 'give a lozpekamon to another player',
	type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'player',
            type: ApplicationCommandOptionType.User,
            description: 'The player to give the monster to',
            required: true
	    },
        {
            name: 'monster',
            type: ApplicationCommandOptionType.String,
            description: 'The monster to give',
            required: true,
            autocomplete: true
        }
    ]
};

export const execute = async function (interaction) {
    let targetUser = interaction.options.getUser('player');
    let monster = interaction.options.getString('monster');
    //console.log('GIVE',message.content);

	// let args = message.content.split(/ +/g);

	// let givingUserId = interaction.user.id;
	// let targetUserId = args[2].replace(/[^0-9]/gi, '');
	// let giveMonsterId = args[3];

	let giverMonsterPath = interaction.user.id+'.'+monster+'.owned';
	let getterMonsterPath = targetUser.id+'.'+monster+'.owned';

	//make sure player isnt giving to self
	//if (targetUser.id == interaction.user.id) return interaction.reply({content: "`You can't give lozpekamon to yourself`", ephemeral: true});

	//make sure monster exists
	if (!MonsterStore.has(monster)) return interaction.reply({content: "`Lozpekamon doesn't exist`", ephemeral: true});

	//make sure player has that monster to offer
	if (!PlayerStore.has(giverMonsterPath)) return interaction.reply({content: "`You don't own that lozpekamon`", ephemeral: true});


	//decrement giver's monster count
	PlayerStore.set(giverMonsterPath, PlayerStore.get(giverMonsterPath) -1);
	if (PlayerStore.get(giverMonsterPath) == 0) PlayerStore.del(giverMonsterPath);

	//increment getters's monster count
	if (!PlayerStore.has(getterMonsterPath)) PlayerStore.set(getterMonsterPath, 1);
	else PlayerStore.set(getterMonsterPath, PlayerStore.get(getterMonsterPath) + 1);

	//success indicator
	interaction.reply({content: "<@" + interaction.user.id+ "> gave <@" + targetUser.id + "> a `" + MonsterStore.get(monster).name.toUpperCase() + "`  " + MonsterStore.get(monster).emoji, ephemeral: false});

	console.log(interaction.user.username,'gave',targetUser.username, monster);
}