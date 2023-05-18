const axios = require('axios');
const { mongoClient } = require('../modules/db.js');
const { BUNGIE_AUTH_ID, BUNGIE_AUTH_SECRET, BUNGIE_API_KEY } = process.env;
const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { oauthTokenURI } = require('../constants/bungieValues.json');
const { rootURI, endpoints } = require('../constants/bungieEndpoints.json');
const { generateEndpoint } = require('../utilities/endpointGenerator.js');

module.exports = {
    exchangeToken,
    refreshToken,
    isAuthenticated,
    authButton: (userId) => {
        return new ButtonBuilder()
            .setLabel('Login at Bungie')
            .setURL(`https://localhost:8443/oauth/authorize/${userId}`)
            .setStyle(ButtonStyle.Link);
    }
};

async function exchangeToken(user, code) {
    const tokenObj = {  grant_type: 'authorization_code', code: code };
    const collection = mongoClient.collections.auth;
    const authData = await makeTokenReq(tokenObj);
    await updateUserAuth(authData, collection, user);
}

async function refreshToken(user) {
    const collection = mongoClient.collections.auth;
    const query = await collection.find({ userId: user.id }).toArray();

    const token = query[0].refreshToken;
    const tokenObj = { grant_type: 'refresh_token', refresh_token: token };
    const authData = await makeTokenReq(tokenObj);
    await updateUserAuth(authData, collection, user);
}

async function isAuthenticated(user) {
    const now = Date.now();
    const collection = mongoClient.collections.auth;
    const query = await collection.find({ userId: user.id }).toArray();

    if (!query.length) {
        return false;
    }

    const userAuth = query[0];

    if (now < userAuth.accessExpDate) {
        return true;
    }

    if (now < userAuth.refreshExpDate) {
        await refreshToken(user);
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
        client_id: BUNGIE_AUTH_ID,
        client_secret: BUNGIE_AUTH_SECRET
    };

    const resp = await axios.post(oauthTokenURI, axiosBody, axiosConfig);
    return resp.data;
}

async function updateUserAuth(data, collection, user) {
    const userId = user.id;
    const username = user.tag;
    const memId = data.membership_id;
    const bungieUser = await getUserData(memId);
    const expireDate = new Date(Date.now() + data.expires_in * 60000);
    const refreshExpDate = new Date(Date.now() + data.refresh_expires_in * 60000);

    const bungieName = bungieUser.data.Response.uniqueName;
    const query = { userId: userId };
    const opts = { upsert: true };
    const update = {
        $set: {
            userId: userId,
            username: username,
            bungieId: memId,
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
    const endpoint = generateEndpoint(getUserById);
    const url = rootURI + endpoint.path;
    return await axios.get(url, axiosConfig);
}
