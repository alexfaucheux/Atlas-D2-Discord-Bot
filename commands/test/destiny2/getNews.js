// Import global functions
const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder, italic } = require('discord.js');

// Import local functions
const { parseHtml } = require('../../../utilities/parseHtml.js');
const { generateEndpointString } = require('../../../utilities/generateEndpoint.js');

// Import constants
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');
const {
    twitIconURL,
    standardURI,
    newsURL,
    apiFooterMsg
} = require('../../../constants/bungieValues.json');

// Assign constants
const { BUNGIE_API_KEY } = process.env;
const destinyNews = endpoints.getBungieNews;

const axiosConfig = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
    }
};

module.exports = {
    data: new SlashCommandBuilder().setName('news').setDescription('Get latest news'),
    async execute(interaction) {
        await getNews(interaction);
    }
};

async function getNews(interaction) {
    let body = '';

    // Generate endpoint using default values
    const endpoint = generateEndpointString(destinyNews);

    // Get latest news feed
    const url = rootURI + endpoint;
    const res = await axios.get(url, axiosConfig);
    const newsFeed = res.data.Response.NewsArticles;

    // Get latest news in feed
    // Possible TODO: Check latest few
    let news = newsFeed[0];
    const title = news.Title.toLowerCase();

    // Do not post news if it is community focus
    if (title.includes('community focus')) {
        return;
    }

    // Include html in body of message if update news.
    // TODO: assign to dedicated hotfix / maintenance channel
    if (title.includes('hotfix') || title.includes('destiny 2 update')) {
        body = await parseHtml(news.HtmlContent);
    }

    // news.Link only stores the path without URI.
    // This makes news.Link the full URL to the news source.
    news.Link = standardURI + news.Link;
    const prefix = italic(news.Description) + '\n\n';

    // Build message to post on discord
    const msgBody = prefix + body;
    const embedMessage = new EmbedBuilder()
        .setColor(0xff33e1)
        .setAuthor({
            name: 'Bungie News',
            iconURL: twitIconURL,
            url: newsURL
        })
        .setTitle(news.Title)
        .setURL(news.Link)
        .setDescription(msgBody)
        .setTimestamp(new Date(news.PubDate))
        .setFooter({ text: apiFooterMsg })
        .setImage(news.ImagePath);

    // Posts discord message to same channel as command
    // TODO: Direct message to specified channel
    // TODO: Use mongoDB to remove redundant posts
    interaction.channel.send({ embeds: [embedMessage] });
}
