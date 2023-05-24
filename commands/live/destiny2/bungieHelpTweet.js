// Import global functions
import { SlashCommandBuilder } from 'discord.js';
import { postHelpTweet } from '../../../services/postTweet';

const oauth = false;
const data = new SlashCommandBuilder()
    .setName('latest-server')
    .setDescription('Gets latest tweet from BungieHelp');

async function execute(interaction) {
    await getLatestTweet(interaction);
}

export { data, execute, oauth };

async function getLatestTweet(interaction) {
    postHelpTweet(interaction.channel, interaction);
}
