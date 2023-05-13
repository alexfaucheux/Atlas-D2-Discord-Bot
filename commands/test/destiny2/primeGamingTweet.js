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
    const tweets = (await getPrimeGamingTweets()).filter((tweet) => {
        const text = tweet.text.toLowerCase();
        return text.includes('destiny') && text.includes('spr.ly');
    });

    const tweet = tweets[0];
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
                twitPrimeIconURL: twitPrimeIconURL,
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

    interaction.channel.send({ embeds: [embedMessage] });
}
