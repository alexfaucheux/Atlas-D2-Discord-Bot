const fs = require('node:fs');
const path = require('node:path');
const { connectMongoDB } = require('./connect-db.js');
const { token } = require('./config.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { getAllCommands } = require('./utilities/getCommands.js');
const { createManifestFiles } = require('./store-manifest-files.js');
const {writeLine, replaceLine} = require('./utilities/commonFun.js');

main();

async function main() {
    const manifestPath = path.join(__dirname, 'manifest');

    if (!fs.existsSync(manifestPath) || fs.readdirSync(manifestPath).length == 0) {
        await createManifestFiles(manifestPath);
    }

    writeLine('Connecting to MongoDB...');
    await connectMongoDB().catch(console.dir);
    replaceLine('Connecting to MongoDB... Complete\n')

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

    // Log in to Discord with your client's token
    client.login(token);
}

