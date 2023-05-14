const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const { nanoid } = require('nanoid');

const { writeLine, replaceLine } = require('../utilities/consoleLineMethods.js');
const { startMongoDB, closeMongoDB, mongoClient } = require('../modules/db.js');
const { generateEndpointString } = require('../utilities/generateEndpoint.js');
const { exchangeToken, refreshToken } = require('../modules/auth.js');
const { oauthURI } = require('../constants/bungieValues.json');
const { BUNGIE_AUTH_ID } = process.env;

const app = express();
const httpPort = 8080;
const httpsPort = 8443;
const httpServer = http.createServer(app);
const key = fs.readFileSync('./selfsigned.key', 'utf-8');
const cert = fs.readFileSync('./selfsigned.crt', 'utf-8');
const httpsServer = https.createServer({ key: key, cert: cert }, app);

let collection;
let username;

const now = Date.now();

startServer();

async function startServer() {
    const mongoConnectStr = 'Connecting to MongoDB...';

    try {
        writeLine(mongoConnectStr);
        await startMongoDB();
        replaceLine(mongoConnectStr + ' done\n');
    } catch (e) {
        await closeMongoDB();
        replaceLine(mongoConnectStr + ' FAILED\n');
        console.error('Unable to connect to MongoDB. Exiting...\n' + e + '\n');
        return;
    }

    collection = mongoClient.collections.auth;

    app.get('/oauth', authenticate);
    app.get('/oauth-callback', callbackAuth);
    app.get('/oauth-refresh', refreshAuth);

    httpsServer.listen(httpsPort, () => {
        console.log(`Listening on https://localhost:${httpsPort}/oauth?user=MrOceanMan&code=3562`);
    });

    httpServer.listen(httpPort, () => {
        console.log(`Listening on http://localhost:${httpPort}/oauth`);
    });
}

async function authenticate(req, res) {
    const user = req.query.user;
    const code = req.query.code;

    username = user + '#' + code;
    const query = await collection.find({ username: username }).toArray();

    if (query.length) {
        const userAuth = query[0];

        if (now < userAuth.accessExpDate) {
            res.send('Already authenticated! You may now close this window.');
            return;
        }

        if (now < userAuth.refreshExpDate) {
            res.redirect('/oauth-refresh');
            return;
        }
    }

    const state = nanoid();

    const endpoint = generateEndpointString({
        path: oauthURI,
        pathParams: {},
        queryParams: {
            response_type: {
                value: 'code'
            },
            client_id: {
                value: BUNGIE_AUTH_ID
            },
            redirect_uri: {
                value: 'https%3A%2F%2Flocalhost%3A8443%2Foauth-callback'
            }
        }
    });

    // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
    res.redirect(endpoint);
}

async function callbackAuth(req, res) {
    const code = req.query.code;

    try {
        await exchangeToken(collection, username, code);
        res.send('Authenticated successfully. You may now close this window.');
    } catch (error) {
        console.error('Access Token Error', error.message);
        res.send('Oh no! An error occured during authentication.');
    }
}

async function refreshAuth(req, res) {
    try {
        await refreshToken(collection, username);
        res.send('Authenticated successfully. You may now close this window.');
    } catch (error) {
        console.error('Access Token Error', error.message);
        res.send('Oh no! An error occured during authentication.');
    }
}
