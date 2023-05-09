const { bungieAPIKey, bungieRootURI } = require('../../../config.js');
const { SlashCommandBuilder, bold, italic } = require('discord.js');
const date = require('date-and-time');
const endpoint = '/Tokens/Rewards/BungieRewards';
const axios = require('axios');
const axiosConfig = {
    headers: {
        'X-API-Key': bungieAPIKey
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
    let reply = "Rewards currently on Bungie's website:\n\n";
    const url = bungieRootURI + endpoint;

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
    interaction.reply(reply);
}
