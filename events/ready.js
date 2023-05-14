const { Events } = require('discord.js');
const { postHelpTweet, postPrimeTweet } = require('../services/postTweet');
const { postNews } = require('../services/postNews');
const { writeLine, replaceLine } = require('../utilities/consoleLineMethods.js');

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
    const hotfixChannel = client.channels.cache.get('1105963741536849941');
    const maintChannel = client.channels.cache.get('1106404992195231784');
    const newsChannel = client.channels.cache.get('1106404370586812586');
    const minutesDelay = 30;

    postHelpTweet(maintChannel);
    postPrimeTweet(newsChannel);
    postNews(newsChannel, hotfixChannel);
    
    setTimeout(() => {
        executeServices(client);
    }, minutesDelay * 60000)
}
