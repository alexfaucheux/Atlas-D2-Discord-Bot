// import global functions
import { SlashCommandBuilder, bold, blockQuote } from 'discord.js';
import date from 'date-and-time';
import axios from 'axios';

// import local functions
import { generateEndpoint } from '../../../utilities/endpointGenerator.js';

// import constants
import { mongoClient } from '../../../modules/db.js';
import { paths, htmlConfig as axiosConfig } from '../../../constants/bungie.js';

// assign constants
const { rootURI, endpoints } = paths;
const endpointObj = endpoints.getBungieRewards;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('rewards')
        .setDescription('(TEST COMMAND) Gets partner reward details.'),
    async execute(interaction) {
        await getPartnerRewards(interaction);
    }
};

async function getPartnerRewards(interaction) {
    const collection = mongoClient.collections.rewards;
    const recordsToInsert = [];

    let prefix = "Rewards currently on Bungie's website:\n\n";
    let reply = '';

    const endpoint = generateEndpoint(endpointObj);
    const url = rootURI + endpoint.path;

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

    interaction.reply({ content: prefix + blockQuote(reply), ephemeral: true });
}
