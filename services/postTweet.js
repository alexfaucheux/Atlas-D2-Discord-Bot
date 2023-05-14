// Import global functions
const { EmbedBuilder, hyperlink } = require('discord.js');

// Import local functions
const { getPrimeGamingTweets, getBungieTweets } = require('../utilities/twitter-scraper.js');

// import constants
const { mongoClient } = require('../modules/db.js');
const {
    twitHelpURL,
    twitHelpIconURL,
    helpForumURL,
    twitFooterMsg,
    twitPrimeURL,
    twitPrimeIconURL,
    twitMainURL
} = require('../constants/bungieValues.json');

module.exports = {
    postHelpTweet,
    postPrimeTweet
};

async function postHelpTweet(channel) {
    const tweets = await getBungieTweets();
    const tweet = tweets[0];

    const collection = mongoClient.collections.tweets;
    const query = await collection.find({twitId: tweet.id}).toArray();

    if (query.length) {
        return;
    }

    collection.insertOne({twitId: tweet.id, url: tweet.url, author: tweet.fullname, obj: tweet})

    const timestamp = new Date(tweet.timestamp.split('·').join(''));
    const textValue =
        tweet.text.replace('here: bungie.net/en/Forums/Topics/…', hyperlink('here', helpForumURL)) +
        '.';

    const embedMessage = new EmbedBuilder()
        .setColor(0xff33e1)
        .setAuthor({ name: tweet.fullname, twitHelpIconURL: twitHelpIconURL, url: twitHelpURL })
        .setTitle('Bungie Server Announcement')
        .setURL(tweet.url)
        .setDescription(textValue)
        .setTimestamp(timestamp)
        .setFooter({ text: twitFooterMsg });

    channel.send({ embeds: [embedMessage] });
}

async function postPrimeTweet(channel) {
    const tweets = (await getPrimeGamingTweets()).filter((tweet) => {
        const text = tweet.text.toLowerCase();
        return text.includes('destiny') && text.includes('spr.ly');
    });
    
    const tweet = tweets[0];
    const collection = mongoClient.collections.tweets;
    const query = await collection.find({twitId: tweet.id}).toArray();

    if (query.length) {
        return;
    }

    collection.insertOne({twitId: tweet.id, url: tweet.url, author: tweet.fullname, obj: tweet})

    const timestamp = new Date(tweet.timestamp.split('·').join(''));
    const textValue = tweet.text
        .replace('@DestinyTheGame', hyperlink('@DestinyTheGame', twitMainURL))
        .replace('@DestinytheGame', hyperlink('@DestinyTheGame', twitMainURL));

    let embedMessage;
    try {
        embedMessage = new EmbedBuilder()
            .setColor(0xff33e1)
            .setAuthor({
                name: tweet.fullname,
                iconURL: twitPrimeIconURL,
                url: twitPrimeURL
            })
            .setTitle('Prime Gaming Announcement')
            .setURL(tweet.url)
            .setDescription(textValue)
            .setTimestamp(timestamp)
            .setFooter({ text: 'Content pulled from Twitter' });
    } catch (e) {
        console.error(e);
        throw e;
    }

    channel.send({ embeds: [embedMessage] });
}
