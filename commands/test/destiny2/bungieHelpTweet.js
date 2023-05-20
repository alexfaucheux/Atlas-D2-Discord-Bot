// Import global functions
const { SlashCommandBuilder} = require('discord.js');
const { postHelpTweet } = require('../../../services/postTweet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest-server')
        .setDescription('Gets latest tweet from BungieHelp'),
    async execute(interaction) {
        await getLatestTweet(interaction);
    }
};

async function getLatestTweet(interaction) {
    postHelpTweet(interaction.channel, interaction);
}
