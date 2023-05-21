const { mongoClient } = require('../../../modules/db.js');
const { SlashCommandBuilder, ButtonBuilder } = require('discord.js');
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');
const { generateEndpoint } = require('../../../utilities/endpointGenerator.js');
const clanSearchEndpoint = endpoints.searchGroupByName;
const { BUNGIE_API_KEY } = process.env;
const axios = require('axios');

const axiosConfig = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
    }
};

module.exports = {
    oauth: true,
    data: new SlashCommandBuilder()
        .setName('register-clan')
        .setDescription('(TEST COMMAND) Register clan for server.')
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
    const clanCollection = mongoClient.collections.clans;
    const authCollection = mongoClient.collections.auth;

    const user = authCollection.find({userId: interaction.user.id}).toArray()[0];
    const bungieId = user.bungieId;

    

    clanSearchEndpoint.bodyProps.groupName.value = clanName;
    const endpoint = generateEndpoint(clanSearchEndpoint);
    const url = rootURI + endpoint.path;

    const resp = await axios.post(url, endpoint.body, axiosConfig);

    const clanDetail = resp.data.Response.detail;

    const button = new ButtonBuilder()
        .setLabel('Confirm')
        .setURL(`${uri}/oauth/authorize/${userId}`)
        .setStyle(ButtonStyle.Link);

    console.log(clanDetail);

    const data = {
        clanId: clanDetail.groupId,
        convoId: clanDetail.conversationId,
        about: clanDetail.about,
        name: clanDetail.name,
        motto: clanDetail.motto,
        bannerPath: rootURI + clanDetail.bannerPath,
        avatarPath: rootURI + clanDetail.avatarPath,
        maxMembers: clanDetail.features.maximumMembers,
        clanProgress: clanDetail.clanInfo.d2ClanProgressions,
        callsign: clanDetail.clanInfo.clanCallsign
    };

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
