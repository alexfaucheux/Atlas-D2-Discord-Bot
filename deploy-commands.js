const { getAllCommands, getTestCommands, getLiveCommands } = require('./utilities/getCommands.js');
const { clientId, token, guildId, args } = require('./config.js');
const { REST, Routes } = require('discord.js');
const {writeLine, replaceLine} = require('./utilities/commonFun.js');

const routeCommands = args.includes('-global')
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, guildId);

async function deployCommands(commands) {
    const rest = new REST().setToken(token);
    try {
        await rest.put(routeCommands, { body: commands });
    } catch (error) {
        console.error(`FAILURE: Unable to deploy commands. Error:\n${error}`);
    }
}

function main() {
    let commands = [];
    const runMode = args.includes('-global') ? 'global' : 'test';
    const deployType = args.includes('-test') ? 'test' : args.includes('-live') ? 'live' : 'all';
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
    replaceLine(consoleStr + 'Complete\n')
}

main();
