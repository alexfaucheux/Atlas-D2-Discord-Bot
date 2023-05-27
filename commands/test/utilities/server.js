import { SlashCommandBuilder } from 'discord.js';

export default {
    oauth: false,
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('(TEST COMMAND) Provides information about the server.'),
    execute: async function (interaction) {
        await interaction.reply(
            `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
        );
    }
};
