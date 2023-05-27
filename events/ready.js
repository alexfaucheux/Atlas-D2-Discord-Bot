import { Events, ActivityType } from "discord.js";
import { postHelpTweet, postPrimeTweet } from "../services/postTweet.js";
import { postNews } from "../services/postNews.js";
import { writeLine, replaceLine } from "../utilities/consoleLineMethods.js";
const { PORT } = process.env;

export default {
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
        postHelpTweet(maintChannel);
        postPrimeTweet(newsChannel);
        postNews(newsChannel, hotfixChannel);
    } else {
        // Test services
    }

    setTimeout(() => {
        executeServices(client);
    }, minutesDelay * 60000);
}

async function rotateActivities() {}
