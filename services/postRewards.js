// import global functions
const { SlashCommandBuilder, bold, blockQuote } = require('discord.js');
const date = require('date-and-time');
const axios = require('axios');

// import local functions
const { generateEndpointString } = require('../../../utilities/generateEndpoint');

// import constants
const { mongoClient } = require('../../../modules/db.js');
const { rootURI, endpoints } = require('../../../constants/bungieEndpoints.json');

// assign constants
const { BUNGIE_API_KEY } = process.env;
const endpointObj = endpoints.getBungieRewards;

const axiosConfig = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
    }
};

module.exports = {
    postRewards
};

async function postRewards(channel) {
    const collection = mongoClient.collections.rewards;
    const recordsToInsert = [];

    let prefix = "Rewards currently on Bungie's website:\n\n";
    let reply = '';

    const endpoint = generateEndpointString(endpointObj);
    const url = rootURI + endpoint;

    const resp = await axios.get(url, axiosConfig);
    const rewardResp = resp.data.Response;

    for (const reward in rewardResp) {
        const q = await collection.find({ _id: reward }).toArray();
        const displayProps = rewardResp[reward].RewardDisplayProperties;
        const objProps = rewardResp[reward].ObjectiveDisplayProperties;
        const props = objProps || displayProps;

        if (!q.length) {
            const rec = {
                _id: reward,
                name: props.Name,
                description: props.Description,
                imgURL: props.ImagePath
            };
            recordsToInsert.push(rec);
        }

        let expireDate = new Date(
            rewardResp[reward].UserRewardAvailabilityModel.AvailabilityModel.RedemptionEndDate
        );

        expireDate = date.format(expireDate, 'MM/DD/YYYY');
        reply += bold(props?.Name + ` (Expires: ${expireDate})`);
        reply += `\n${props?.Description}\n\n`;
    }

    if (recordsToInsert.length) {
        collection.insertMany(recordsToInsert);
    }

    interactiont.reply({content: prefix + blockQuote(reply), ephemeral: true});
}
