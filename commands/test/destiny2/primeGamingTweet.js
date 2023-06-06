import { SlashCommandBuilder } from 'discord.js';
import { postPrimeTweet } from '../../../services/postTweet.js';

export default {
    oauth: false,
    data: new SlashCommandBuilder()
        .setName('latest-prime')
        .setDescription('Gets latest tweet from Prime Gaming about Destiny 2'),
    execute: async function (interaction) {
        await getLatestTweet(interaction);
    }
};

async function getLatestTweet(interaction) {
    await postPrimeTweet(interaction.channel, interaction);
}
