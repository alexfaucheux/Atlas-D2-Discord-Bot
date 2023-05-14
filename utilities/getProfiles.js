// Import global functions
const axios = require('axios');

// Import local functions
const { generateEndpointString } = require('./generateEndpoint');

// Import constants
const { rootURI, endpoints } = require('../constants/bungieEndpoints.json');

// Assign constants
const { BUNGIE_API_KEY } = process.env;
const endpointObj = endpoints.searchPlayerByName;

const axiosConfig = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
    }
};

module.exports = {
    getProfiles,
    getMainProfile
};

async function getProfiles(bungieName) {
    const profiles = [];
    const [name, nameCode] = bungieName.split('#');

    // Generate endpoint using default values
    const endpoint = generateEndpointString(endpointObj);
    const url = rootURI + endpoint;

    const axiosBody = {
        displayName: name,
        displayNameCode: nameCode
    };
    const resp = await axios.post(url, axiosBody, axiosConfig);

    const bungieResp = resp.data.Response;
    for (const key in bungieResp) {
        const platform = bungieResp[key];
        const memType = platform.membershipType;
        const memId = platform.membershipId;
        const main = !!platform.applicableMembershipTypes?.length;
        profiles.push({ type: memType, id: memId, main: main });
    }

    return profiles;
}

async function getMainProfile(bungieName) {
    const profiles = await getProfiles(bungieName);
    return profiles.filter(profile => profile.main)[0];
}
