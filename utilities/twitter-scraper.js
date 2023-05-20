const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { hyperlink } = require('discord.js');
const { twitterURI, twitterInstURI } = require('../constants/bungieValues.json');

const INSTANCE = twitterInstURI;
const twitterRootURI = twitterURI;
const parentDir = path.dirname(__dirname);

module.exports = {
    getBungieTweets: async () => await getTweets('from:BungieHelp'),
    getPrimeGamingTweets: async () => await getTweets('from:primegaming'),
    generateTweetFiles
};

async function getTweets(query) {
    const tweets = await scrapeTweets(query, 1);
    return Promise.resolve(tweets);
}

async function scrapeTweets(query, batches) {
    let cursor;
    const tweets = [];

    for (let i = 0; i < batches; i++) {
        let resp;

        if (!cursor) {
            resp = await axios.get(`${INSTANCE}/search?f=tweet&q=${query}`);
        } else {
            resp = await axios.get(`${INSTANCE}/search${cursor}`);
        }

        const $ = cheerio.load(resp.data);

        let $tweet = $('div.timeline-item:first');
        cursor = $('div.show-more:last a').attr('href');

        while ($tweet.length > 0) {
            const $content = $tweet.find('div.tweet-content.media-body');

            if (!$content.length) {
                $tweet = $tweet.next();
                continue;
            }

            const $tweetLink = $tweet.find('a.tweet-link');
            const $fullname = $tweet.find('a.fullname:first');
            const $username = $tweet.find('a.username:first');
            const $date = $tweet.find('span.tweet-date').find('a');
            const avatarUri = $tweet.find('img.avatar').attr('src');

            const profileUrl = twitterRootURI + $username.attr('href');
            const tweetLink = $tweetLink.attr('href').split('#')[0];
            const linkSplit = tweetLink.split('/');
            const url = twitterRootURI + tweetLink;

            const bodyText = getBodyTextWithHyperlinks($content);
            const attachments = getAttachments($tweet);
            const stats = getTweetStats($tweet);

            const timestamp = new Date($date.attr('title').split('·').join(''));

            const tweetObj = {
                id: linkSplit[linkSplit.length - 1],
                url: url,
                text: bodyText,
                stats: stats,
                profileURL: profileUrl,
                avatarURL: INSTANCE + avatarUri,
                timestamp: timestamp,
                fullname: $fullname.text(),
                username: $username.text(),
                attachments: attachments
            };

            tweets.push(tweetObj);
            $tweet = $tweet.next();
        }
    }

    return tweets;
}

function getAttachments($tweet) {
    const attachments = [];
    let $imageAttachment = $tweet.find('div.attachment.image:first');
    let $videoAttachment = $tweet.find('div.attachment.video-container:first');

    while ($imageAttachment.length > 0) {
        const imgSrc = $imageAttachment.find('a img').attr('src');
        const obj = {
            type: 'image',
            src: INSTANCE + imgSrc
        };
        attachments.push(obj);
        $imageAttachment = $imageAttachment.next();
    }

    while ($videoAttachment.length > 0) {
        const vidSrc = $videoAttachment.find('video').attr('data-url');
        const vidUrl = $videoAttachment.find('video').attr('href');
        const obj = {
            type: 'video',
            src: INSTANCE + vidSrc
        };
        attachments.push(obj);
        $videoAttachment = $videoAttachment.next();
    }

    return attachments;
}

function getTweetStats($tweet) {
    const stats = [];
    let $statContainer = $tweet.find('span.tweet-stat:first');

    while ($statContainer.length > 0) {
        const $stat = $statContainer.find('div');
        const statClass = $stat.find('span').attr('class');
        const statCounter = $stat.text();
        const statName = statClass.split('-')[1] + 's';

        stats.push({
            name: statName,
            counter: statCounter.trim()
        });

        $statContainer = $statContainer.next();
    }

    return stats;
}

function getBodyTextWithHyperlinks($content) {
    let $anchor = $content.find('a:first');
    let text = $content.text();

    while ($anchor.length > 0) {
        const uri = $anchor.attr('href');
        const url = uri.includes('http') ? uri : twitterRootURI + $anchor.attr('href');
        const $anchorText = $anchor.prop('innerText');
        const textLink = hyperlink($anchorText, url);
        text = text.replace($anchorText, textLink);
        $anchor = $anchor.next();
    }

    return text;
}

async function generateTweetFiles(query) {
    const tweets = await scrapeTweets(query, 1);
    for (const tweet of tweets) {
        const tweetFolderPath = path.join(parentDir, 'tweets');
        const tweetFilePath = path.join(tweetFolderPath, `${tweet.id}.json`);

        if (!fs.existsSync(tweetFolderPath)) {
            fs.mkdirSync(tweetFolderPath);
        }

        fs.writeFileSync(tweetFilePath, JSON.stringify(tweet, null, 2));
    }
}

if (require.main === module) {
    generateTweetFiles('from:BungieHelp');
    scrapeTweets('from:primegaming', 1).then((tweets) =>
        console.log(JSON.stringify(tweets, null, 2))
    );
}
