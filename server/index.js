const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const { nanoid } = require('nanoid');

const { startMongoDB, closeMongoDB } = require('../modules/db.js');
const { generateEndpoint } = require('../utilities/endpointGenerator.js');
const { writeLine, replaceLine } = require('../utilities/consoleLineMethods.js');
const { exchangeToken, refreshToken, isAuthenticated } = require('../modules/auth.js');
const { oauthURI } = require('../constants/bungieValues.json');
const { Client, GatewayIntentBits } = require('discord.js');
const { BUNGIE_AUTH_ID, DISCORD_TOKEN, PORT } = process.env;

const app = express();
const key = PORT ? '' : fs.readFileSync('./selfsigned.key', 'utf-8');
const cert = PORT ? '' : fs.readFileSync('./selfsigned.crt', 'utf-8');
const httpsServer = PORT ? null : https.createServer({ key: key, cert: cert }, app);

const httpsPort = 8443;
const httpPort = PORT || 8080;
const httpServer = http.createServer(app);
const uri = PORT ? 'https://atlas-d2-discord-bot.onrender.com' : 'https://localhost:' + httpsPort

let user;

if (require.main === module) {
    startServerWithMongo();
}

module.exports = {
    startServer
};

async function startServerWithMongo() {
    const connected = await startMongo();
    if (connected) {
        startServer();
    }
}

async function startMongo() {
    const mongoConnectStr = 'Connecting to MongoDB...';
    try {
        writeLine(mongoConnectStr);
        await startMongoDB();
        replaceLine(mongoConnectStr + ' done\n');
    } catch (e) {
        await closeMongoDB();
        replaceLine(mongoConnectStr + ' FAILED\n');
        console.error('Unable to connect to MongoDB. Exiting...\n' + e + '\n');
        return false;
    }

    return true;
}

async function startServer() {
    app.get('/oauth/authorize/:id', authenticate);
    app.get('/oauth/callback', callbackAuth);
    app.get('/oauth/refresh', refreshAuth);
    app.get('/oauth/success/:auth', respSuccess);
    app.get('/oauth/error', respError);
    app.get('/healthz', (req, res) => res.send('ok'));

    httpServer.listen(httpPort, () => {});

    if (!PORT) {
        httpsServer.listen(httpsPort, () => {});
    }
}

async function authenticate(req, res) {
    const userId = req.params.id;
    let redirectUri = `${uri}/oauth/callback`;
    redirectUri = redirectUri.replace(':', '%3A').replace('/', '%2F');
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.login(DISCORD_TOKEN);
    user = await client.users.fetch(userId);
    const authenticated = await isAuthenticated(user);

    if (authenticated) {
        res.redirect('/oauth/success/0');
        return;
    }

    const state = nanoid();

    const endpoint = generateEndpoint({
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
                value: redirectUri
            }
        },
        bodyProps: {}
    });

    // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
    res.redirect(endpoint.path);
}

async function callbackAuth(req, res) {
    const code = req.query.code;

    try {
        await exchangeToken(user, code);
        res.redirect('/oauth/success/1');
    } catch (error) {
        console.error('Access Token Error:\n', error);
        res.redirect('/oauth/error');
    }
}

async function refreshAuth(req, res) {
    try {
        await refreshToken(user);
        res.redirect('/oauth/success/1');
    } catch (error) {
        console.error('Access Token Error:\n', error);
        res.redirect('/oauth/error');
    }
}

async function respSuccess(req, res) {
    const auth = req.params.auth;
    if (auth == 1) {
        res.send('Authenticated successfully! You may now close this window.');
    } else {
        res.send('Already authenticated! You may now close this window.');
    }
}

async function respError(req, res) {
    res.send('Oh no! An error occurred during authentication.');
}
