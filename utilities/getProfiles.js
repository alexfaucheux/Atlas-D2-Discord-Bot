const endpoint = '/Destiny2/SearchDestinyPlayerByBungieName/All/';
const { bungieAPIKey, bungieRootURI } = require('../config.js');
const axios = require('axios');

const axiosConfig = {
    headers: {
        'X-API-Key': bungieAPIKey
    }
};

module.exports = {
    getProfiles: (bungieName) => getProfiles(bungieName)
};

async function getProfiles(bungieName) {
    const profiles = [];
    const nameSplit = bungieName.split('#');
    const name = nameSplit[0];
    const nameCode = nameSplit[1];
    const url = bungieRootURI + endpoint;

    const axiosData = {
        displayName: name,
        displayNameCode: nameCode
    };

    const resp = await axios.post(url, axiosData, axiosConfig);
    const bungieResp = resp.data.Response;

    for (const platform in bungieResp) {
        const memType = bungieResp[platform].membershipType;
        const memId = bungieResp[platform].membershipId;
        profiles.push({ type: memType, id: memId });
    }

    return profiles;
}
