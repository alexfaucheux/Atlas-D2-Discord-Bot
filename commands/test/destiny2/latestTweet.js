// Import global functions
const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');

// Import local functions
const { getBungieTweets } = require('../../../utilities/twitter-scraper');

// import constants
const { mongoClient } = require('../../../modules/db.js');
const {
    twitHelpURL,
    twitHelpIconURL,
    helpForumURL,
    twitFooterMsg
} = require('../../../constants/bungieValues.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest-server')
        .setDescription('Gets latest tweet from BungieHelp'),
    async execute(interaction) {
        await getLatestTweet(interaction);
    }
};

async function getLatestTweet(interaction) {
    const tweets = await getBungieTweets();
    const tweet = tweets[0];

    const collection = mongoClient.collections.tweets;
    const query = await collection.find({twitId: tweet.id}).toArray();

    if (query.length) {
        interaction.reply({content: 'Latest Prime Gaming news already posted!', ephemeral: true});
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

    interaction.channel.send({ embeds: [embedMessage] });
}
