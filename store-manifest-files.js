const { bungieAPIKey, bungieRootURI } = require('./config.js');
const fs = require('fs');
const axios = require('axios');
const {resetLine, replaceLine} = require('./utilities/commonFun.js');

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

    return Promise.resolve(manifestMap);
};

const createManifestFile = async (filePath, contentDefURL) => {
    const manifestContent = await axios.get(contentDefURL);

    try {
        await fs.promises.writeFile(filePath, JSON.stringify(manifestContent.data));
    } catch (err) {
        return Promise.reject({error: err, filePath: filePath});
    }

    return Promise.resolve();
};

const createManifestFiles = async (manifestPath) => {
    const manifestMap = await getManifestUrls();
    const manifestSize = Object.keys(manifestMap).length;

    const printProgress = (progress) => {
        let progressLine = `Writing manifest files... ${progress}/${manifestSize}`;
        if (progress == manifestSize) {
            progressLine += ' Complete\n';
        }
        replaceLine(progressLine);
    }

    if (!fs.existsSync(manifestPath)) {
        fs.mkdirSync(manifestPath);
    }

    let progress = 0;

    printProgress(progress);
    for (const filePath in manifestMap) {
        const contentDefURL = manifestMap[filePath];
        await createManifestFile(filePath, contentDefURL).then(() => {
            progress += 1;
            printProgress(progress);
        }).catch((err) => {
            resetLine();
            console.error(`\n[ERROR] Could not write file: ${err.filePath}\n${err.error}\n`);
            printProgress(progress);
        });
    }
};

module.exports = {
    createManifestFiles: async (manifestPath) => createManifestFiles(manifestPath)
}
