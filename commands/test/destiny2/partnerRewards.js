// import global functions
const { SlashCommandBuilder, bold, blockQuote } = require('discord.js');
const date = require('date-and-time');
const axios = require('axios');

// import local functions
const { generateEndpointString } = require('../../../utilities/generateEndpoint');

// import constants
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
    data: new SlashCommandBuilder()
        .setName('rewards')
        .setDescription('Gets partner reward details.'),
    async execute(interaction) {
        await getPartnerRewards(interaction);
    }
};

async function getPartnerRewards(interaction) {
    let prefix = "Rewards currently on Bungie's website:\n\n";
    let reply = '';

    const endpoint = generateEndpointString(endpointObj);
    const url = rootURI + endpoint;

    const resp = await axios.get(url, axiosConfig);
    const rewardResp = resp.data.Response;

    for (const reward in rewardResp) {
        const displayProps = rewardResp[reward].RewardDisplayProperties;
        const objProps = rewardResp[reward].ObjectiveDisplayProperties;
        const props = objProps || displayProps;

        let expireDate = new Date(
            rewardResp[reward].UserRewardAvailabilityModel.AvailabilityModel.RedemptionEndDate
        );
        expireDate = date.format(expireDate, 'MM/DD/YYYY');
        reply += bold(displayProps?.Name + ` (Expires: ${expireDate})`);
        reply += `\n${props?.Description}\n\n`;
    }

    interaction.reply(prefix + blockQuote(reply));
}
