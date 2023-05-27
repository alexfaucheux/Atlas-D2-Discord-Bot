import { SlashCommandBuilder } from 'discord.js';

export default {
    oauth: false,
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('(TEST COMMAND) Provides information about the user.'),
    execute: async function (interaction) {
        await interaction.reply(
            `This command was run by ${interaction.user.tag}, who joined on ${interaction.member.joinedAt}.`
        );
    }
};
