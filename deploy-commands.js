const { getAllCommands, getTestCommands, getLiveCommands } = require('./utilities/getCommands.js');
const { clientId, token, guildId, args } = require('./config.js');
const { REST, Routes } = require('discord.js');

const routeCommands = args.includes('-global')
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, guildId);

async function deployCommands(commands) {
    const rest = new REST().setToken(token);
    try {
        console.log(`Deploying ${commands.length} application (/) commands...`);

        await rest.put(routeCommands, { body: commands });

        console.log(`SUCCESS: ${commands.length} commands where successfully deployed`);
    } catch (error) {
        console.error(`FAILURE: Unable to deploy commands. Error:\n${error}`);
    }
}

function main() {
    let commands = [];
    const runMode = args.includes('-global') ? 'global' : 'test';
    const deployType = args.includes('-test') ? 'test' : args.includes('-live') ? 'live' : 'all';
    console.log(`Deploying commands in ${runMode} mode.\n`);

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

    deployCommands(commands);
}

main();
