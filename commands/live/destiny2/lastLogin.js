// Import global functions
import axios from 'axios';
import date from 'date-and-time';
import { SlashCommandBuilder } from 'discord.js';

// Import local functions
import { getProfiles } from '../../../utilities/profile.js';
import { generateEndpoint } from '../../../utilities/endpointGenerator.js';

// Import constants
import * as bungie from '../../../constants/bungie.js';

// Assign constants
const { api: rootURI } = bungie.urls;
const { endpoints, htmlConfig: axiosConfig } = bungie.api;
const profileEndpoint = endpoints.getDestinyProfile;

export default {
    oauth: false,
    data: new SlashCommandBuilder()
        .setName('last-login')
        .setDescription("Gets a user's last login date.")
        .addStringOption((option) => {
            return option
                .setName('bungie-name')
                .setDescription('the player to query')
                .setRequired(true);
        }),
    execute: async function (interaction) {
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
