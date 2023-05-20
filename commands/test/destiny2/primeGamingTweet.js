const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');
const { postPrimeTweet } = require('../../../services/postTweet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest-prime')
        .setDescription('Gets latest tweet from Prime Gaming about Destiny 2'),
    async execute(interaction) {
        await getLatestTweet(interaction);
    }
};

async function getLatestTweet(interaction) {
    postPrimeTweet(interaction.channel, interaction);
}
