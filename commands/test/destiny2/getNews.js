// Import global functions
const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder, italic } = require('discord.js');

// Import local functions
const { parseHtml } = require('../../../utilities/htmlParser.js');
const { generateEndpoint } = require('../../../utilities/endpointGenerator.js');

// Import constants
const { mongoClient } = require('../../../modules/db.js');
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
    const endpoint = generateEndpoint(destinyNews);

    // Get latest news feed
    const url = rootURI + endpoint.path;
    const res = await axios.get(url, axiosConfig);
    const newsFeed = res.data.Response.NewsArticles.filter(
        (article) => !article.Title.toLowerCase().includes('community focus')
    );

    // Get latest news in feed
    // Possible TODO: Check latest few
    let news = newsFeed[0];
    const title = news.Title.toLowerCase();

    // news.Link only stores the path without URI.
    // This makes news.Link the full URL to the news source.
    news.Link = standardURI + news.Link;
    const prefix = italic(news.Description) + '\n\n';

    const collection = mongoClient.collections.bungieNews;
    const query = await collection.find({ link: news.Link }).toArray();

    if (query.length) {
        interaction.reply({ content: 'Most recent news already posted!', ephemeral: true });
        return;
    }

    collection.insertOne({ title: news.Title, date: news.PubDate, link: news.Link });

    try {
    // Include html in body of message if update news.
    // TODO: assign to dedicated hotfix / maintenance channel
    if (title.includes('hotfix')) {
        body = await parseHtml(news.HtmlContent);
    }

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
        .setFooter({ text: apiFooterMsg || 'Bungie API' })
        .setImage(news.ImagePath);

    // Posts discord message to same channel as command
    // TODO: Direct message to specified channel
    // TODO: Use mongoDB to remove redundant posts
    await interaction.channel.send({ embeds: [embedMessage] }).catch(console.error(e));
    } catch (e) {
        console.error(e);
    }
}
