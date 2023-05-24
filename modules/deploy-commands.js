// Import global functions
import {
  REST,
  Routes,
} from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

// Import local functions
import {
  getLiveCommands,
  getTestCommands,
} from '../utilities/commands.js';
import {
  replaceLine,
  writeLine,
} from '../utilities/consoleLineMethods.js';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);


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
    const deployType = argv.includes('-live') ? 'live' : 'test';
    const consoleStr = `Deploying commands in ${runMode} mode... `;

    switch (deployType) {
        case 'live':
            commands = getLiveCommands('deploy');
            break;
        case 'test':
            commands = getTestCommands('deploy');
            break;
        default:
            console.log('Deploy type not supported');
    }

    writeLine(consoleStr);
    deployCommands(commands);
    replaceLine(consoleStr + 'done\n');
}
