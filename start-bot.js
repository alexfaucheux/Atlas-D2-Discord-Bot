// Import global functions
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('node:path');
const dotenv = require('dotenv');
const fs = require('node:fs');
dotenv.config();

// Import local functions
const { getTestCommands, getLiveCommands } = require('./utilities/commands.js');
const { startMongoDB, closeMongoDB } = require('./modules/db.js');
const { writeLine, replaceLine } = require('./utilities/consoleLineMethods.js');
const { startServer } = require('./server/index.js');

const { TEST_DISCORD_TOKEN, DISCORD_TOKEN, PORT } = process.env;

const discordToken = DISCORD_TOKEN
// const discordToken = PORT ? DISCORD_TOKEN : TEST_DISCORD_TOKEN

if (require.main === module) {
    main();
}

async function main() {
    const mongoConnectStr = 'Connecting to MongoDB...';
    const serverStr = 'Starting server... ';

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

    try {
        writeLine(serverStr);
        await startServer();
        replaceLine(serverStr + ' done\n');
    } catch (e) {
        replaceLine(serverStr + ' FAILED\n')
        console.error('Unable to start server. Exiting...\n' + e + '\n');
        return;
    }

    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    if (PORT) {
        client.commands = getLiveCommands('client');
    } else {
        client.commands = getTestCommands('client');
    }

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
    client.login(discordToken);
}
