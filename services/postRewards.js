// import global functions
import { bold, blockQuote } from "discord.js";
import date from "date-and-time";
import axios from "axios";

// import local functions
import { generateEndpoint } from "../../../utilities/endpointGenerator";

// import constants
import { mongoClient } from "../../../modules/db.js";
import paths from '../../../constants/bungieEndpoints.js';

// assign constants
const { rootURI, endpoints } = paths;
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

    try {
        channel.send({ content: prefix + blockQuote(reply), ephemeral: true });
        if (recordsToInsert.length) {
            collection.insertMany(recordsToInsert);
        }
    } catch (e) {
        console.error('Error posting to rewards channel:', e);
    }
}
