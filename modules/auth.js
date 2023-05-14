const axios = require('axios');
const { mongoClient } = require('../modules/db.js');
const { BUNGIE_AUTH_ID, BUNGIE_AUTH_SECRET, BUNGIE_API_KEY } = process.env;
const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { oauthTokenURI } = require('../constants/bungieValues.json');
const { rootURI, endpoints } = require('../constants/bungieEndpoints.json');
const { generateEndpointString } = require('../utilities/generateEndpoint');

module.exports = {
    exchangeToken,
    refreshToken,
    isAuthenticated,
    authButton: (username) => {
        const [user, code] = username.split('#');
        return new ButtonBuilder()
            .setLabel('Login at Bungie')
            .setURL(`https://localhost:8443/oauth?user=${user}&code=${code}`)
            .setStyle(ButtonStyle.Link);
    }
};

async function exchangeToken(username, code) {
    const tokenObj = { code: code };
    const collection = mongoClient.collections.auth;
    const authData = await makeTokenReq(tokenObj);
    await updateUserAuth(authData, collection, username);
}

async function refreshToken(username) {
    const collection = mongoClient.collections.auth;
    const query = await collection.find({ username: username }).toArray();

    const token = query[0].refreshToken;
    const tokenObj = { refresh_token: token };
    const authData = await makeTokenReq(tokenObj);
    await updateUserAuth(authData, collection, username);
}

async function isAuthenticated(username) {
    const now = Date.now();
    const collection = mongoClient.collections.auth;
    const query = await collection.find({ username: username }).toArray();

    if (!query.length) {
        return false;
    }

    const userAuth = query[0];

    if (now < userAuth.accessExpDate) {
        return true;
    }

    if (now < userAuth.refreshExpDate) {
        await refreshToken(collection, username);
        return true;
    }

    return false;
}

async function makeTokenReq(tokenObj) {
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    const axiosBody = {
        ...tokenObj,
        grant_type: 'authorization_code',
        client_id: BUNGIE_AUTH_ID,
        client_secret: BUNGIE_AUTH_SECRET
    };

    const resp = await axios.post(oauthTokenURI, axiosBody, axiosConfig);
    return resp.data;
}

async function updateUserAuth(data, collection, username) {
    const refreshExpDate = new Date(Date.now() + data.refresh_expires_in * 60000);
    const expireDate = new Date(Date.now() + data.expires_in * 60000);
    const memId = data.membership_id;

    const user = await getUserData(memId);
    const bungieName = user.data.Response.uniqueName;
    const query = { username: username };
    const opts = { upsert: true };
    const update = {
        $set: {
            memId: memId,
            username: username,
            bungieName: bungieName,
            accessExpDate: expireDate,
            refreshExpDate: refreshExpDate,
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        }
    };

    await collection.updateOne(query, update, opts);
}

async function getUserData(id) {
    const axiosConfig = {
        headers: {
            'X-API-KEY': BUNGIE_API_KEY
        }
    };
    const { getUserById } = endpoints;
    getUserById.pathParams.id.value = id;
    const endpoint = await generateEndpointString(getUserById);
    const url = rootURI + endpoint;
    return await axios.get(url, axiosConfig);
}
