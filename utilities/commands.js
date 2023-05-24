// Import global functions
import fs from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";

const getAllCommands = (type) => getCommands(type, 'all');
const getLiveCommands = (type) => getCommands(type, 'live');
const getTestCommands = (type) => getCommands(type, 'test')

export {getAllCommands, getLiveCommands, getTestCommands};

function getCommands(type, subfolder) {
    const fileToFolderPath = {};
    let commandFiles;

    if (subfolder == 'live' || subfolder == 'test') {
        commandFiles = getCommandFiles(fileToFolderPath, subfolder);
    } else {
        const liveFiles = getCommandFiles(fileToFolderPath, 'live');
        const testFiles = getCommandFiles(fileToFolderPath, 'test');
        commandFiles = [...liveFiles, ...testFiles];
    }

    const commands = getCommandList(commandFiles, fileToFolderPath, type);

    return commands;
}

function getCommandFiles(fileToFolderPath, subfolder) {
    const parentDir = path.dirname(__dirname);
    let foldersPath = path.join(parentDir, 'commands');
    foldersPath = path.join(foldersPath, subfolder);

    if (!fs.existsSync(foldersPath)) {
        fs.mkdirSync(foldersPath);
    }

    const commandFolders = fs.readdirSync(foldersPath);
    let commandFiles = [];

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const folderFiles = fs.readdirSync(commandsPath).filter((file) => {
            fileToFolderPath[file] = commandsPath;
            return file.endsWith('.js');
        });
        commandFiles = [...commandFiles, ...folderFiles];
    }

    return commandFiles;
}

function getCommandList(commandFiles, fileToFolderPath, type) {
    const commands = type == 'client' ? new Collection() : [];
    for (const file of commandFiles) {
        const folderPath = fileToFolderPath[file];
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (!('data' in command) || !('execute' in command)) {
            const fileName = path.basename(filePath);
            console.log(
                `\n[WARNING] The command at ${fileName} is missing a required "data" or "execute" property.\n`
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
