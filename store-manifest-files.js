const { bungieAPIKey, bungieRootURI } = require('./config.js');
const fs = require('fs');
const axios = require('axios');

const config = {
    headers: {
        'X-API-Key': bungieAPIKey
    }
};

const getManifestUrls = async () => {
    const manifestMap = {};
    const endpoint = bungieRootURI + '/Destiny2/Manifest/';
    const result = await axios.get(endpoint, config);
    const contentManifests = result.data.Response.jsonWorldComponentContentPaths.en;

    for (const label in contentManifests) {
        const contentDefURL = contentManifests[label];
        let fileName = label.split('Destiny')[1].split('Definition')[0] + '.json';
        let filePath = './manifest/' + fileName;
        manifestMap[filePath] = 'https://bungie.net' + contentDefURL;
    }

    return manifestMap;
};

const createManifestFile = async (filePath, contentDefURL) => {
    const manifestContent = await axios.get(contentDefURL);
    fs.writeFile(filePath, JSON.stringify(manifestContent.data), (err) => {
        if (err) {
            console.error(`[ERROR] Could not write file: ${filePath}\n${err}`);
            return;
        }

        console.log(`Created ${filePath}`);
    });
};

const createManifestFiles = async () => {
    const manifestMap = await getManifestUrls();

    for (const filePath in manifestMap) {
        const contentDefURL = manifestMap[filePath];
        createManifestFile(filePath, contentDefURL);
    }
};

createManifestFiles();
