// Import global functions
const { REST, Routes } = require('discord.js');

// Import local functions
const { getAllCommands, getTestCommands, getLiveCommands } = require('../utilities/getCommands.js');
const { writeLine, replaceLine } = require('../utilities/consoleLineMethods.js');

// If ran directly, convert .env properties to environment vars
if (require.main == module) {
    const dotenv = require('dotenv');
    dotenv.config();
}

const argv = process.argv;
const { CLIENT_ID, DISCORD_TOKEN, TEST_SERVER_ID } = process.env;
const routeCommands = argv.includes('-global')
    ? Routes.applicationCommands(CLIENT_ID)
    : Routes.applicationGuildCommands(CLIENT_ID, TEST_SERVER_ID);

if (require.main === module) {
    main();
}

async function deployCommands(commands) {
    const rest = new REST().setToken(DISCORD_TOKEN);
    try {
        await rest.put(routeCommands, { body: commands });
    } catch (error) {
        console.error(`FAILURE: Unable to deploy commands. Error:\n${error}`);
    }
}

function main() {
    let commands = [];
    const runMode = argv.includes('-global') ? 'global' : 'test';
    const deployType = argv.includes('-live') ? 'live' : 'all';
    const consoleStr = `Deploying commands in ${runMode} mode... `;

    switch (deployType) {
        case 'test':
            commands = getTestCommands('deploy');
            break;
        case 'live':
            commands = getLiveCommands('deploy');
            break;
        default:
            commands = getAllCommands('deploy');
    }

    writeLine(consoleStr);
    deployCommands(commands);
    replaceLine(consoleStr + 'Complete\n');
}
