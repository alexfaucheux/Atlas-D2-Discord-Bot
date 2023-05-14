const axios = require('axios');
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');
const { getMainProfile } = require('../../../utilities/getProfiles');
const { generateEndpointString } = require('../../../utilities/generateEndpoint.js');
const { getDestinyProfile, getActivityHistory, getCarnageReport } = endpoints;
const { mongoClient } = require('../../../modules/db.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { BUNGIE_API_KEY } = process.env;

const axiosConfig = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
    }
};

module.exports = {
    data: new SlashCommandBuilder().setName('weapons').setDescription('Gets weapon stats'),
    async execute(interaction) {
        await getWeaponStats(interaction);
    }
};

async function getWeaponStats(interaction) {}
