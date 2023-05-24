import { SlashCommandBuilder } from 'discord.js';

const oauth = false;
const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('(TEST COMMAND) Provides information about the user.');
async function execute(interaction) {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply(
        `This command was run by ${interaction.user.tag}, who joined on ${interaction.member.joinedAt}.`
    );
}

export { data, execute, oauth };
