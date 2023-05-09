const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inter')
		.setDescription('Provides information about the interaction.'),
	async execute(interaction) {
		console.log(interaction);
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`This interaction is logged.`);
	}
};
