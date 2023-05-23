const { Events, ActivityType } = require('discord.js');
const { postHelpTweet, postPrimeTweet } = require('../services/postTweet');
const { postNews } = require('../services/postNews');
const { writeLine, replaceLine } = require('../utilities/consoleLineMethods.js');
const { PORT } = process.env;

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: (client) => {
        writeLine('Starting services... ');
        executeServices(client);
        replaceLine('Starting services... done\n');
        console.log(`\nLogged in as ${client.user.tag}.`);
        client.user.setActivity('Destiny 2');
    }
};

async function executeServices(client) {
    const hotfixChannel = client.channels.cache.get('1107412400954679346');
    const maintChannel = client.channels.cache.get('1107412524867002518');
    const newsChannel = client.channels.cache.get('1107412292120875168');
    const minutesDelay = 1;

    if (PORT) {
        // Live services
        postHelpTweet(maintChannel).catch(e => console.warn('Posting help tweet failed.'));
        postPrimeTweet(newsChannel).catch(e => console.warn('Posting prime tweet failed.'));
        postNews(newsChannel, hotfixChannel).catch(e => console.warn('Posting news failed.'));
    } else {
        // Test services
    }

    setTimeout(() => {
        executeServices(client);
    }, minutesDelay * 60000);
}

async function rotateActivities() {}
