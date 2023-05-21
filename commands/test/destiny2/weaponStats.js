const axios = require('axios');
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');
const { getMainProfile } = require('../../../utilities/profile.js');
const { generateEndpoint } = require('../../../utilities/endpointGenerator.js');
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
    data: new SlashCommandBuilder().setName('weapons').setDescription('(TEST COMMAND) Gets weapon stats'),
    async execute(interaction) {
        await getWeaponStats(interaction);
    }
};

async function getWeaponStats(interaction) {}
