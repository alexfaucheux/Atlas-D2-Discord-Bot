// Import global functions
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Import local functions
const { resetLine, replaceLine } = require('../utilities/consoleLineMethods.js');

// Import constants
const { rootURI, endpoints } = require('../constants/bungieEndpoints.json');
const { generateEndpoint } = require('../utilities/endpointGenerator.js');

// If ran directly, convert .env properties to environment vars
if (require.main == module) {
    const dotenv = require('dotenv');
    dotenv.config();
}

// Assign constants
const { BUNGIE_API_KEY } = process.env;
const manifestEndpoint = endpoints.getDestinyManifest;

const config = {
    headers: {
        'X-API-Key': BUNGIE_API_KEY
    }
};

// If ran directly, create manifest files
if (require.main === module) {
    const parentDir = path.dirname(__dirname);
    const manifestPath = path.join(parentDir, 'manifest');
    createManifestFiles(manifestPath);
}

module.exports = {
    createManifestFiles
};

async function createManifestFiles(manifestPath) {
    const manifestMap = await getManifestUrls();
    const manifestSize = Object.keys(manifestMap).length;

    const printProgress = (progress) => {
        let progressLine = `Writing manifest files... ${progress}/${manifestSize}`;
        if (progress == manifestSize) {
            progressLine += ' done\n';
        }
        replaceLine(progressLine);
    };

    if (!fs.existsSync(manifestPath)) {
        fs.mkdirSync(manifestPath);
    }

    let progress = 0;

    printProgress(progress);
    for (const filePath in manifestMap) {
        const contentDefURL = manifestMap[filePath];
        createManifestFile(filePath, contentDefURL)
            .then(() => {
                progress += 1;
                printProgress(progress);
            })
            .catch((err) => {
                resetLine();
                console.error(`\n[ERROR] Could not write file: ${err.filePath}\n${err.error}\n`);
                printProgress(progress);
            });
    }
}

async function getManifestUrls() {
    const manifestMap = {};
    const endpoint = generateEndpoint(manifestEndpoint);
    const url = rootURI + endpoint.path;
    const result = await axios.get(url, config);
    const contentManifests = result.data.Response.jsonWorldComponentContentPaths.en;

    for (const label in contentManifests) {
        const contentDefURL = contentManifests[label];
        let fileName = label.split('Destiny')[1].split('Definition')[0] + '.json';
        let filePath = './manifest/' + fileName;
        manifestMap[filePath] = 'https://bungie.net' + contentDefURL;
    }

    return Promise.resolve(manifestMap);
}

async function createManifestFile(filePath, contentDefURL) {
    const manifestContent = await axios.get(contentDefURL);

    try {
        await fs.promises.writeFile(filePath, JSON.stringify(manifestContent.data));
    } catch (err) {
        return Promise.reject({ error: err, filePath: filePath });
    }

    return Promise.resolve();
}


