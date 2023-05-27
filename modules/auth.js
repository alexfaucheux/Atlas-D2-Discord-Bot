import axios from 'axios';
import { mongoClient } from '../modules/db.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import * as bungie from '../constants/bungie.js';
import { generateEndpoint } from '../utilities/endpointGenerator.js';

const { api: rootURI, oauthToken: oauthTokenURI } = bungie.urls;
const { endpoints } = bungie.api;
const { PORT } = process.env;

const authButton = (userId) => {
    const uri = PORT ? 'https://atlas-d2-discord-bot.onrender.com' : 'https://localhost:8443';
    return new ButtonBuilder()
        .setLabel('Login at Bungie')
        .setURL(`${uri}/oauth/authorize/${userId}`)
        .setStyle(ButtonStyle.Link);
};

export { exchangeToken, refreshToken, isAuthenticated, authButton };

async function exchangeToken(user, code) {
    const tokenObj = { grant_type: 'authorization_code', code: code };
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
    const { tokenBody, htmlConfig: axiosConfig } = bungie.oauth;

    const axiosBody = {
        ...tokenObj,
        ...tokenBody
    };

    const resp = await axios.post(oauthTokenURI, axiosBody, axiosConfig);
    return resp.data;
}

async function updateUserAuth(data, collection, user) {
    const userId = user.id;
    const username = user.tag;
    const memId = data.membership_id;
    const userResp = await getUserData(memId, data.access_token);
    const expireDate = new Date(Date.now() + (data.expires_in / 60) * 60000);
    const refreshExpDate = new Date(Date.now() + (data.refresh_expires_in / 60) * 60000);

    const userData = userResp.data.Response;
    const platId = userData.primaryMembershipId;
    const platform = userData.destinyMemberships.filter((mem) => mem.membershipId == platId)[0];
    const bungieName = userData.bungieNetUser.uniqueName;
    const platType = platform.membershipType;
    const platIconURL = rootURI.replace('/Platform', '') + platform.iconPath;
    const query = { userId: userId };
    const opts = { upsert: true };
    const update = {
        $set: {
            userId: userId,
            username: username,
            bungieId: memId,
            bungieName: bungieName,
            platformId: platId,
            platformType: platType,
            platIconURL: platIconURL,
            accessExpDate: expireDate,
            refreshExpDate: refreshExpDate,
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        }
    };

    await collection.updateOne(query, update, opts);
}

async function getUserData(id, accessToken) {
    const axiosConfig = bungie.oauth.getAxiosAuthHeader(accessToken);
    const { getCurrentUser } = endpoints;
    const endpoint = generateEndpoint(getCurrentUser);
    const url = rootURI + endpoint.path;
    return await axios.get(url, axiosConfig);
}
