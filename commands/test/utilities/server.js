import { SlashCommandBuilder } from 'discord.js';

const oauth = false;
const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('(TEST COMMAND) Provides information about the server.');

async function execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    await interaction.reply(
        `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
    );
}

export { data, execute, oauth };
