// Import global functions
const axios = require('axios');
const date = require('date-and-time');
const { SlashCommandBuilder } = require('discord.js');

// Import local functions
const { getProfiles } = require('../../../utilities/profile.js');
const { generateEndpoint } = require('../../../utilities/endpointGenerator.js');

// Import constants
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');

// Assign constants
const { BUNGIE_API_KEY } = process.env;
const profileEndpoint = endpoints.getDestinyProfile;

const axiosConfig = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
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
        interaction.reply({
            content: 'Invalid name. Please include the 4 digit code. e.g. Destiny#1234',
            ephemeral: true
        });
        return;
    }

    const profiles = await getProfiles(bungieName);

    // Iterates each profile returned
    for (const profile of profiles) {
        profileEndpoint.pathParams.membershipType.value = profile.type;
        profileEndpoint.pathParams.destinyMembershipId.value = profile.id;
        const endpoint = generateEndpoint(profileEndpoint);

        // Get profile details
        const url = rootURI + endpoint.path;
        const resp = await axios.get(url, axiosConfig);
        const dateLastPlayed = resp.data.Response?.profile?.data?.dateLastPlayed;

        if (dateLastPlayed) {
            lastPlayedList.push(dateLastPlayed);
        }
    }

    if (!lastPlayedList.length) {
        interaction.reply({ content: 'No data available for this request.', ephemeral: true });
        return;
    }

    lastPlayedList.sort((a, b) => b - a);
    let lastPlayedDate = new Date(lastPlayedList[0]);

    const offset = lastPlayedDate.getTimezoneOffset();
    lastPlayedDate = new Date(lastPlayedDate.getTime() - offset * 60 * 1000);
    lastPlayedDate = date.format(lastPlayedDate, 'MM/DD/YYYY');

    const reply = `Last Login for ${bungieName}: ${lastPlayedDate}`;
    interaction.reply(reply);
}
