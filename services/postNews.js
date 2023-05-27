// Import global functions
import axios from 'axios';
import { EmbedBuilder, italic } from 'discord.js';

// Import local functions
import { parseHtml } from '../utilities/htmlParser.js';
import { generateEndpoint } from '../utilities/endpointGenerator.js';

// Import constants
import { mongoClient } from '../modules/db.js';
import * as bungie from '../constants/bungie.js';
import * as twitter from '../constants/twitter.js';
const { api: rootURI, standard: standardURI, news: newsURL } = bungie.urls;
const { endpoints, htmlConfig: axiosConfig } = bungie.api;
const apiFooterMsg = bungie.footerMsg;
const { bungieIcon: iconURL } = twitter.paths.imagePaths;

// Assign constants
const destinyNews = endpoints.getBungieNews;
export { postNews };
async function postNews(newsChannel, hotfixChannel) {
    let body = '';
    let channel = newsChannel;

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
        return;
    }

    // Include html in body of message if update news.
    // TODO: assign to dedicated hotfix / maintenance channel
    if (title.includes('hotfix')) {
        body = await parseHtml(news.HtmlContent);
        channel = hotfixChannel;
    }

    // Build message to post on discord
    const msgBody = prefix + body;
    const embedMessage = new EmbedBuilder()
        .setColor(0xff33e1)
        .setAuthor({
            name: 'Bungie News',
            iconURL: iconURL,
            url: newsURL
        })
        .setTitle(news.Title)
        .setURL(news.Link)
        .setDescription(msgBody)
        .setTimestamp(new Date(news.PubDate))
        .setFooter({
            text: apiFooterMsg
        })
        .setImage(news.ImagePath);

    // Posts discord message to same channel as command
    // TODO: Direct message to specified channel
    // TODO: Use mongoDB to remove redundant posts

    try {
        await channel.send({ embeds: [embedMessage] });
        collection.insertOne({
            title: news.Title,
            date: news.PubDate,
            link: news.Link
        });
    } catch (e) {
        console.error('Error posting to news channel:', e);
    }
}
