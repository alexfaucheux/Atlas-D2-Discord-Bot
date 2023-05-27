// import * as dotenv from 'dotenv';
// dotenv.config();

import 'dotenv/config.js';

import fs from 'node:fs';
import { URL } from 'url';

// Import global functions
import { Client, GatewayIntentBits } from 'discord.js';

import { closeMongoDB, startMongoDB } from './modules/db.js';
import { startServer } from './server/index.js';
// Import local functions
import { getLiveCommands, getTestCommands } from './utilities/commands.js';
import { replaceLine, writeLine } from './utilities/consoleLineMethods.js';

const { DISCORD_TOKEN, PORT, argv } = process.env;

// if (require.main === module) {
//     main();
// }

main();

async function main() {
    const mongoConnectStr = 'Connecting to MongoDB...';
    const serverStr = 'Starting server... ';

    try {
        writeLine(mongoConnectStr);
        await startMongoDB();
        replaceLine(mongoConnectStr + ' done\n');
    } catch (e) {
        await closeMongoDB();
        replaceLine(mongoConnectStr + ' FAILED\n');
        console.error('Unable to connect to MongoDB. Exiting...\n' + e + '\n');
        return;
    }

    try {
        writeLine(serverStr);
        await startServer();
        replaceLine(serverStr + ' done\n');
    } catch (e) {
        replaceLine(serverStr + ' FAILED\n');
        console.error('Unable to start server. Exiting...\n' + e + '\n');
        return;
    }

    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    if (PORT) {
        client.commands = await getLiveCommands('client');
    } else {
        client.commands = await getTestCommands('client');
    }

    const eventsPath = new URL('./events', import.meta.url);
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = new URL(eventsPath.href + '/' + file);
        const { default: event } = await import(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    // Log in to Discord with your client's DISCORD_TOKEN
    client.login(DISCORD_TOKEN);
}
