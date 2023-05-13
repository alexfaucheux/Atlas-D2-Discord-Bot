// Import global functions
const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

module.exports = {
    getAllCommands: (type) => getCommands(type, 'all'),
    getLiveCommands: (type) => getCommands(type, 'live'),
};

function getCommands(type, subfolder) {
    const fileToFolderPath = {};
    let commandFiles;

    if (subfolder == 'live') {
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
