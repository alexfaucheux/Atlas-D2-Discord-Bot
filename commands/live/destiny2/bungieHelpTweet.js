// Import global functions
import { SlashCommandBuilder } from "discord.js";
import { postHelpTweet } from "../../../services/postTweet";

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
