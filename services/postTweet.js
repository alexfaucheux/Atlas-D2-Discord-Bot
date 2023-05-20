// Import global functions
const { EmbedBuilder } = require('discord.js');

// Import local functions
const { getPrimeGamingTweets, getBungieTweets } = require('../utilities/twitter-scraper.js');

// import constants
const { mongoClient } = require('../modules/db.js');

module.exports = {
    postHelpTweet,
    postPrimeTweet
};

async function postHelpTweet(channel, interaction) {
    const tweets = await getBungieTweets();
    const title = 'Bungie Server Announcement';
    postTweet(channel, tweets[0], title, interaction);
}

async function postPrimeTweet(channel, interaction) {
    const tweets = (await getPrimeGamingTweets()).filter((tweet) => {
        const text = tweet.text.toLowerCase();
        return text.includes('destiny') && text.includes('spr.ly');
    });
    const title = 'Prime Gaming Announcement';
    postTweet(channel, tweets[0], title, interaction);
}

async function postTweet(channel, tweet, title, interaction) {
    const collection = mongoClient.collections.tweets;
    const query = await collection.find({ twitId: tweet?.id }).toArray();
    const footerMsg = 'Content pulled from Twitter';

    if (query.length || !tweet) {
        if (interaction) {
            interaction.reply({
                content: 'Latest tweet already posted!',
                ephemeral: true
            });
        }
        return;
    }

    collection.insertOne({ twitId: tweet.id, url: tweet.url, author: tweet.fullname, obj: tweet });

    const embedMessage = new EmbedBuilder()
        .setColor(0xff33e1)
        .setAuthor({
            name: tweet.fullname,
            iconURL: tweet.avatarURL,
            url: tweet.profileURL
        })
        .setTitle(title)
        .setURL(tweet.url)
        .setDescription(tweet.text)
        .setTimestamp(tweet.timestamp)
        .setFooter({ text: footerMsg })
        .setImage(tweet.attachments[0]?.src);

    channel.send({ embeds: [embedMessage] });
}
