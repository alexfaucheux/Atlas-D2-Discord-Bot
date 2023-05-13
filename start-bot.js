// Import global functions
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('node:path');
const dotenv = require('dotenv');
const fs = require('node:fs');
dotenv.config();

// Import local functions
const { getAllCommands } = require('./utilities/getCommands.js');
const { startMongoDB, closeMongoDB } = require('./modules/db.js');
const { writeLine, replaceLine } = require('./utilities/consoleLineMethods.js');

const { DISCORD_TOKEN } = process.env;

if (require.main === module) {
    main();
}

async function main() {
    const mongoConnectStr = 'Connecting to MongoDB...';

    try {
        writeLine(mongoConnectStr);
        await startMongoDB();
        replaceLine(mongoConnectStr + ' done\n');
    } catch (e) {
        await closeMongoDB();
        replaceLine(mongoConnectStr + ' FAILED\n')
        console.error('Unable to connect to MongoDB. Exiting...\n' + e + '\n');
        return;
    }

    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.commands = getAllCommands('client');

    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    // Log in to Discord with your client's DISCORD_TOKEN
    client.login(DISCORD_TOKEN);
}
