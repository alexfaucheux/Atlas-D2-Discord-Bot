import { SlashCommandBuilder } from 'discord.js';

export default {
    oauth: false,
    data: new SlashCommandBuilder()
        .setName('inter')
        .setDescription('(TEST COMMAND) Provides information about the interaction.'),
    execute: async function (interaction) {
        console.log(interaction);
        // interaction.guild is the object representing the Guild in which the command was run
        await interaction.reply(`This interaction is logged.`);
    }
};
