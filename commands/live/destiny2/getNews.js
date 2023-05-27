// Import global functions
import axios from 'axios';
import { SlashCommandBuilder, EmbedBuilder, italic } from 'discord.js';

// Import local functions
import { parseHtml } from '../../../utilities/htmlParser.js';
import { generateEndpoint } from '../../../utilities/endpointGenerator.js';

// Import constants
import { mongoClient } from '../../../modules/db.js';
import * as bungie from '../../../constants/bungie.js';
import * as twitter from '../../../constants/twitter.js';

const { standard: standardURI, api: rootURI, news: newsURL } = bungie.urls;
const { endpoints, htmlConfig: axiosConfig } = bungie.api;
const { bungieIcon: twitIconURL } = twitter.paths.imagePaths;
const destinyNews = endpoints.getBungieNews;

console.log(twitIconURL);

export default {
    oauth: false,
    data: new SlashCommandBuilder().setName('news').setDescription('Get latest news'),
    execute: async function (interaction) {
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
    // if (query.length) {
    //     interaction.reply({
    //         content: 'Most recent news already posted!',
    //         ephemeral: true
    //     });
    //     return;
    // }

    collection.insertOne({
        title: news.Title,
        date: news.PubDate,
        link: news.Link
    });

    // Include html in body of message if update news.
    // TODO: assign to dedicated hotfix / maintenance channel
    if (title.includes('hotfix') || title.includes('destiny 2 update')) {
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
        .setFooter({
            text: bungie.footerMsg
        })
        .setImage(news.ImagePath);

    // Posts discord message to same channel as command
    // TODO: Direct message to specified channel
    // TODO: Use mongoDB to remove redundant posts
    interaction.channel.send({
        embeds: [embedMessage]
    });
}
