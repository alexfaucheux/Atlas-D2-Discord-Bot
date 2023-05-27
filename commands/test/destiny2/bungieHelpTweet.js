// Import global functions
import { SlashCommandBuilder } from 'discord.js';
import { postHelpTweet } from '../../../services/postTweet.js';

export default {
    oauth: false,
    data: new SlashCommandBuilder()
        .setName('latest-server')
        .setDescription('Gets latest tweet from BungieHelp'),
    execute: async function (interaction) {
        await getLatestTweet(interaction);
    }
};

async function getLatestTweet(interaction) {
    postHelpTweet(interaction.channel, interaction);
}
