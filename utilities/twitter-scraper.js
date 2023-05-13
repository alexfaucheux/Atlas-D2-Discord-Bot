const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

const parentDir = path.dirname(__dirname);
const folderPath = path.join(parentDir, 'twint-zero');
const INSTANCE = 'nitter.1d4.us';
const FORMAT = 'json';

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
    const stdout = scrape();
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
