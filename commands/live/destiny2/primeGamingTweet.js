import { SlashCommandBuilder } from 'discord.js';
import { postPrimeTweet } from '../../../services/postTweet';

const oauth = false;
const data = new SlashCommandBuilder()
    .setName('latest-prime')
    .setDescription('Gets latest tweet from Prime Gaming about Destiny 2');

async function execute(intereaction) {
    await getLatestTweet(interaction);
}

export { data, execute, oauth};

async function getLatestTweet(interaction) {
    postPrimeTweet(interaction.channel, interaction);
}
