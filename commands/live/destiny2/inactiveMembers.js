const { mongoClient } = require('../../../modules/db.js');
const {
    SlashCommandBuilder,
    EmbedBuilder,
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
    },
    timeout: 12000
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inactive-members')
        .setDescription('Time since last login for inactive clan members.'),
    async execute(interaction) {
        await getMemberLogins(interaction);
    }
};

async function getMemberLogins(interaction) {
    await interaction.deferReply();
    const clanCollection = mongoClient.collections.clans;
    const clanQuery = await clanCollection.find({ serverId: interaction.guild.id }).toArray();

    if (!clanQuery.length) {
        interaction.editReply({
            content:
                'You must register your clan before using this command. You can register using /register-clan.'
        });
        return;
    }

    const clan = clanQuery[0];
    const { getGroupMembers } = endpoints;
    getGroupMembers.pathParams.groupId.value = clan.clanId;

    const endpoint = generateEndpoint(getGroupMembers);
    const url = rootURI + endpoint.path;
    const resp = await axios.get(url, axiosConfig).catch((e) => console.error(e));
    const memberData = resp.data.Response.results;

    const members = await getLoginData(memberData);

    let deepFreezeMemberStr = '';
    let frozenMemberStr = '';
    let laggyMemberStr = '';
    let activeMemberStr = '';

    for (const member of members) {
        const lastLogin = member.daysSinceLastLogin;
        if (lastLogin >= 100) {
            deepFreezeMemberStr += `${member.username}\n`;
        } else if (lastLogin >= 60) {
            frozenMemberStr += `${member.username}\n`;
        } else if (lastLogin >= 30) {
            laggyMemberStr += `${member.username}\n`;
        } else {
            activeMemberStr += `${member.username}\n`;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0xff33e1)
        .setTitle(`Days Since Last Login for Inactive Members`)
        .setTimestamp(new Date())
        .setFooter({ text: `${clan.name} • Bungie API`})
        .setFields(
            { name: '30-59', value: laggyMemberStr, inline: true },
            { name: '60-99', value: frozenMemberStr, inline: true },
            { name: '100+', value: deepFreezeMemberStr, inline: true }
        );

    await interaction.editReply({embeds: [embed]})
}

async function getLoginData(memberData, members) {
    members = !members ? [] : members;
    // const batchSize = 20;
    const nextMembers = {};
    const profilePromiseList = [];
    const { getDestinyProfile } = endpoints;

    for (const key in memberData) {
        const member = memberData[key].destinyUserInfo;

        // if (profilePromiseList.length == batchSize) {
        //     nextMembers[key] = member;
        // }

        const platformType = member.membershipType;
        const platformId = member.membershipId;

        getDestinyProfile.pathParams.destinyMembershipId.value = platformId;
        getDestinyProfile.pathParams.membershipType.value = platformType;
        const endpoint = generateEndpoint(getDestinyProfile);
        const url = rootURI + endpoint.path;
        const profilePromise = axios.get(url, axiosConfig);
        profilePromiseList.push(profilePromise)
    }

    const profileRespList = await Promise.allSettled(profilePromiseList);

    for (const profileResp of profileRespList) {
        if (profileResp.status == 'rejected') {
            console.error(profileResp.reason);
            continue;
        }

        const profile = profileResp.value.data.Response.profile.data;
        const name = profile.userInfo.bungieGlobalDisplayName;
        const code = profile.userInfo.bungieGlobalDisplayNameCode;

        const newMember = {
            username: name + '#' + code,
            lastLogin: profile.dateLastPlayed,
            daysSinceLastLogin: Math.floor(
                (new Date() - new Date(profile.dateLastPlayed)) / (1000 * 60 * 60 * 24)
            )
        };

        members.push(newMember);
    }

    if (nextMembers.length > 0) {
        return getLoginData(nextMembers, members);
    }

    return members;
}
