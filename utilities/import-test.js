// import a from './export-test.js';
// import * as twitter from './constants/twitter.js';
import { bold } from 'discord.js';
import { URL } from 'url';
import fs from 'node:fs';

const commandsURL = new URL('../commands', import.meta.url);
const commandFolders = fs.readdirSync(commandsURL);

let commands;

for (const folder of commandFolders) {
    const commandsPath = new URL(commandsURL.href + '/' + folder);
    commands = fs.readdirSync(commandsPath);
}
console.log(commands);