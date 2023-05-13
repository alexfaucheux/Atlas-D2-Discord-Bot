const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');
const { getPrimeGamingTweets } = require('../../../utilities/twitter-scraper');
const {
    twitPrimeURL,
    twitPrimeIconURL,
    twitMainURL
} = require('../../../constants/bungieValues.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest-prime')
        .setDescription('Gets latest tweet from Prime Gaming about Destiny 2'),
    async execute(interaction) {
        await getLatestTweet(interaction);
    }
};

async function getLatestTweet(interaction) {
    const tweets = await getPrimeGamingTweets();
    let tweet;
    for (const tweetObj of tweets) {
        const text = tweetObj.text.toLowerCase();
        if (text.includes('destiny') && text.includes('spr.ly')) {
            tweet = tweetObj;
            break;
        }
    }

    let embedMessage;

    const timestamp = new Date(tweet.timestamp.split('·').join(''));
    const textValue = tweet.text
        .replace('@DestinyTheGame', hyperlink('@DestinyTheGame', twitMainURL))
        .replace('@DestinytheGame', hyperlink('@DestinyTheGame', twitMainURL));
    // .replace(shortLink, hyperlink(shortLink, shortLink));

    try {
        embedMessage = new EmbedBuilder()
            .setColor(0xff33e1)
            .setAuthor({ name: tweet.fullname, twitPrimeIconURL: twitPrimeIconURL, url: twitPrimeURL })
            .setTitle('Prime Gaming Announcement')
            .setURL(tweet.url)
            .setDescription(textValue)
            .setTimestamp(timestamp)
            .setFooter({ text: 'Content pulled from Twitter' });
    } catch (e) {
        console.error(e);
        throw e;
    }

    interaction.channel.send({ embeds: [embedMessage] });
}
