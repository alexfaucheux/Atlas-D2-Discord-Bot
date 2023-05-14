const axios = require('axios');
const { BUNGIE_AUTH_ID, BUNGIE_AUTH_SECRET } = process.env;
const { oauthTokenURI } = require('../constants/bungieValues.json');

module.exports = {
    refreshToken,
    exchangeToken
};

async function refreshToken(collection, username) {
    const query = await collection.find({ username: username }).toArray();
    const token = query[0].refreshToken;
    const tokenObj = { refresh_token: token };

    const authData = await makeTokenReq(tokenObj);
    await updateUserAuth(authData, collection, username);
}

async function exchangeToken(collection, username, code) {
    const tokenObj = { code: code };
    const authData = await makeTokenReq(tokenObj);
    await updateUserAuth(authData, collection, username);
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
    const expireDate = new Date(Date.now() + data.expires_in * 60000);
    const refreshExpDate = new Date(Date.now() + data.refresh_expires_in * 60000);
    const query = { username: username };
    const update = {
        $set: {
            username: username,
            memId: data.membership_id,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            accessExpDate: expireDate,
            refreshExpDate: refreshExpDate
        }
    };

    const opts = {
        upsert: true
    };

    await collection.updateOne(query, update, opts);
}
