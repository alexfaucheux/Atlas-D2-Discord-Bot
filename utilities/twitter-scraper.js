const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const { default: axios } = require('axios');
const cheerio = require('cheerio');
const { hyperlink } = require('discord.js');

const parentDir = path.dirname(__dirname);
const folderPath = path.join(parentDir, 'twint-zero');
const INSTANCE = 'nitter.1d4.us';
const FORMAT = 'json';
const twitterRootURI = 'https://www.twitter.com';

const scrape = (query) =>
    execSync(
        `cd ${folderPath} && go run main.go -Query "${query}" -Instance "${INSTANCE}" -Format "${FORMAT}"`,
        { encoding: 'utf-8' }
    );

if (require.main === module) {
    generateTweetFiles();
}

module.exports = {
    getBungieTweets: async () => await getTweets('from:BungieHelp'),
    getPrimeGamingTweets: async () => await getTweets('from:primegaming'),
    generateTweetFiles
};

async function getTweets(query) {
    const tweetObjList = [];
    const stdout = scrape(query);
    const tweets = stdout.split('\n');

    for (const tweet of tweets) {
        let tweetObj;
        try {
            tweetObj = JSON.parse(tweet);
        } catch (e) {
            continue;
        }

        tweetObjList.push(tweetObj);
    }

    return Promise.resolve(tweetObjList);
}

async function generateTweetFiles() {
    const stdout = scrape('from:BungieHelp');
    const tweets = stdout.split('\n');
    for (const tweet of tweets) {
        let tweetObj;
        try {
            tweetObj = JSON.parse(tweet);
        } catch (e) {
            continue;
        }

        const tweetFolderPath = path.join(parentDir, 'tweets');
        const tweetFilePath = path.join(tweetFolderPath, `${tweetObj.id}.json`);

        if (!fs.existsSync(tweetFolderPath)) {
            fs.mkdirSync(tweetFolderPath);
        }

        fs.writeFileSync(tweetFilePath, tweet);
    }
}

async function makeRequest(query) {
    const tweets = [];
    const resp = await axios.get(`https://${INSTANCE}/search?f=tweet&q=${query}`);
    const $ = cheerio.load(resp.data);
    let $tweet = $('div.timeline-item:first');

    while ($tweet.length > 0) {
        const tweetObj = {};
        const $body = $tweet.find('div.tweet-body');
        const $content = $body.find('div.tweet-content.media-body');
        const $attachment = $body.find('div.attachments');
        const textBody = populateHyperlinks($content);

        tweetObj.body = textBody;
        tweets.push(tweetObj);
        $tweet = $tweet.next();
    }
    console.log(tweets);
}

function populateHyperlinks($content) {
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

if (require.main === module) {
    makeRequest('from:primegaming');
}
