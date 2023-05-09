const { getProfiles } = require('../../../utilities/getProfiles.js');
const { bungieAPIKey, bungieRootURI } = require('../../../config.js');
const { SlashCommandBuilder } = require('discord.js');
const date = require('date-and-time');
const axios = require('axios');

const axiosConfig = {
    headers: {
        'X-API-Key': bungieAPIKey
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('last-login')
        .setDescription("Gets a user's last login date.")
        .addStringOption((option) => {
            return option
                .setName('bungie-name')
                .setDescription('the player to query')
                .setRequired(true);
        }),
    async execute(interaction) {
        await getLastLogin(interaction);
    }
};

async function getLastLogin(interaction) {
    const bungieName = interaction.options.getString('bungie-name');
    const fullName = bungieName.split('#');
    const lastPlayedList = [];

    if (fullName.length != 2 || fullName[1].length != 4) {
        interaction.reply('```Invalid name. Please include the 4 digit code. e.g. Destiny#1234```');
        return;
    }

    const profiles = await getProfiles(bungieName);

    for (const profile of profiles) {
        console.log(profile);
        const endpoint = `/Destiny2/${profile.type}/Profile/${profile.id}/?components=100`;
        const url = bungieRootURI + endpoint;
        const resp = await axios.get(url, axiosConfig);
        const dateLastPlayed = resp.data.Response?.profile?.data?.dateLastPlayed;

        if (dateLastPlayed) {
            lastPlayedList.push(dateLastPlayed);
        }
    }

    lastPlayedList.sort((a, b) => b - a);
    let lastPlayedDate = new Date(lastPlayedList[0]);

    const offset = lastPlayedDate.getTimezoneOffset();
    lastPlayedDate = new Date(lastPlayedDate.getTime() - offset * 60 * 1000);
    lastPlayedDate = date.format(lastPlayedDate, 'MM/DD/YYYY');

    const reply = `\`\`\`Last Login for ${bungieName}: ${lastPlayedDate}\`\`\``;
    interaction.reply(reply);
}
