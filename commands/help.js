module.exports.config = {
	name: 'lozpekamon-help', 
	description: 'learn how to play the lozpekamon monster catching game',
	type: 1
};

module.exports.execute = async function (interaction) {
	await interaction.reply({content: 'help yourself', ephemeral: true });
}	