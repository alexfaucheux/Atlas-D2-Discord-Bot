const { mongoClient } = require('../../../modules/db.js');
const { SlashCommandBuilder } = require('discord.js');
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');
const { generateEndpoint } = require('../../../utilities/endpointGenerator.js');
const clanSearchEndpoint = endpoints.searchGroupByName;
const { BUNGIE_API_KEY } = process.env;
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register-clan')
        .setDescription('Register clan for server.')
        .addStringOption((option) => {
            return option
                .setName('clan-name')
                .setDescription('Clan name to register.')
                .setRequired(true);
        }),
    async execute(interaction) {
        await registerClanName(interaction);
    }
};

async function registerClanName(interaction) {
    const clanName = interaction.options.getString('clan-name');
    const collection = mongoClient.collections.clans;
    const axiosConfig = {
        headers: {
            'X-API-Key': BUNGIE_API_KEY
        }
    };

    clanSearchEndpoint.bodyProps.groupName.value = clanName;
    const endpoint = generateEndpoint(clanSearchEndpoint);
    const url = rootURI + endpoint.path;

    const resp = await axios.post(url, endpoint.body, axiosConfig);

    const clanDetail = resp.data.Response.detail;

    interaction.reply({ content: 'Data logged to console.', ephemeral: true });
    // await collection.updateOne(
    //     { guildId: interaction.guild.id },
    //     { $set: { clanName: clanName } },
    //     { upsert: true }
    // );
    // interaction.reply({
    //     content: `Bungie name ${bungieName} successfully registered for user ${discordName}`
    // });
}
