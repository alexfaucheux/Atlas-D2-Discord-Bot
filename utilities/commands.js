// Import global functions
import fs from 'node:fs';
import { Collection } from 'discord.js';
import { URL } from 'url';

const getAllCommands = (type) => getCommands(type, 'all');
const getLiveCommands = (type) => getCommands(type, 'live');
const getTestCommands = (type) => getCommands(type, 'test');

export { getAllCommands, getLiveCommands, getTestCommands };

async function getCommands(type, subfolder) {
    const fileToFolderPath = {};
    let commandFiles;

    if (subfolder == 'live' || subfolder == 'test') {
        commandFiles = getCommandFiles(fileToFolderPath, subfolder);
    } else {
        const liveFiles = getCommandFiles(fileToFolderPath, 'live');
        const testFiles = getCommandFiles(fileToFolderPath, 'test');
        commandFiles = [...liveFiles, ...testFiles];
    }

    const commands = await getCommandList(commandFiles, fileToFolderPath, type);

    return commands;
}

function getCommandFiles(fileToFolderPath, subfolder) {
    const foldersPath = new URL(`../commands/${subfolder}`, import.meta.url);

    if (!fs.existsSync(foldersPath)) {
        fs.mkdirSync(foldersPath);
    }

    const commandFolders = fs.readdirSync(foldersPath);
    let commandFiles = [];

    for (const folder of commandFolders) {
        const commands = new URL(foldersPath.href + '/' + folder);
        const files = fs.readdirSync(commands).filter((file) => {
            // console.log(file);
            fileToFolderPath[file] = commands.href;
            return file.endsWith('.js');
        });
        commandFiles = [...commandFiles, ...files];
    }

    return commandFiles;
}

async function getCommandList(commandFiles, fileToFolderPath, type) {
    const commands = type == 'client' ? new Collection() : [];
    for (const file of commandFiles) {
        const folderPath = fileToFolderPath[file];
        const filePath = new URL(`${folderPath}/${file}`);
        const { default: command } = await import(filePath);

        if (!command || !('data' in command) || !('execute' in command)) {
            console.log(
                `\n[WARNING] The command at ${file} is missing a required "data" or "execute" property.\n`
            );
            continue;
        }

        if (type == 'client') {
            commands.set(command.data.name, command);
        } else {
            commands.push(command.data.toJSON());
        }
    }

    return commands;
}
