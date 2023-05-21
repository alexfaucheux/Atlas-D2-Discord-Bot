const { mongoClient } = require('../../../modules/db.js');
const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    bold
} = require('discord.js');
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');
const { generateEndpoint } = require('../../../utilities/endpointGenerator.js');
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
    const collectorFilter = (i) => i.user.id === interaction.user.id;
    interaction.deferReply();
    const serverId = interaction.guild.id;
    const serverName = interaction.guild.name;
    const clanSearchEndpoint = endpoints.searchGroupByName;
    const clanName = interaction.options.getString('clan-name');
    const clanCollection = mongoClient.collections.clans;
    const authCollection = mongoClient.collections.auth;

    const authQuery = await authCollection.find({ userId: interaction.user.id }).toArray();
    const user = authQuery[0];

    const platId = user.platformId;
    const platType = user.platformType;

    axiosConfig.headers['Authorization'] = 'Bearer ' + user.accessToken;

    clanSearchEndpoint.bodyProps.groupName.value = clanName;
    const endpoint = generateEndpoint(clanSearchEndpoint);
    const url = rootURI + endpoint.path;

    let resp;
    // try {
    resp = await axios.post(url, endpoint.body, axiosConfig);
    // } catch (e) {
    //     console.error(e);
    // }

    const clanResponse = resp.data.Response;
    const clanDetail = clanResponse.detail;
    const memberMap = clanResponse.currentUserMemberMap;
    let memberType;

    for (const member in memberMap) {
        memberType = memberMap[member].memberType;
    }

    const confirmButton = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    const response = await interaction.editReply({
        content:
            `Register clan ${bold(clanDetail.name)} with ` +
            bold(`${clanDetail.memberCount} members`) +
            '?',
        components: [row]
    });

    let confirmation;

    try {
        const minuteDelay = 1;
        confirmation = await response.awaitMessageComponent({
            filter: collectorFilter,
            time: minuteDelay * 60000
        });
    } catch (e) {
        await interaction.editReply({
            content: 'Confirmation not received within 1 minute, cancelling',
            components: []
        });
        return;
    }

    if (confirmation.customId === 'cancel') {
        confirmation.update({ content: 'Clan registration canceled.', components: [] });
        return;
    } else if (confirmation.customId === 'confirm') {
        await confirmation.deferUpdate();
    }

    if (!memberType || memberType < 3) {
        confirmation.editReply({
            content: 'You must be admin or higher in this clan to register it to this server.',
            components: []
        });
        return;
    }

    const data = {
        clanId: clanDetail.groupId,
        serverId: serverId,
        serverName: serverName,
        convoId: clanDetail.conversationId,
        about: clanDetail.about,
        name: clanDetail.name,
        motto: clanDetail.motto,
        bannerPath: rootURI.replace('/Platform', '') + clanDetail.bannerPath,
        avatarPath: rootURI.replace('/Platform', '') + clanDetail.avatarPath,
        maxMembers: clanDetail.features.maximumMembers,
        clanProgress: clanDetail.clanInfo.d2ClanProgressions,
        callsign: clanDetail.clanInfo.clanCallsign
    };

    await clanCollection.updateOne({ serverId: serverId }, { $set: data }, { upsert: true });
    confirmation.editReply({
        content: `${bold(clanDetail.name)} successfully registered to ${bold(serverName)}`,
        components: []
    });
}
