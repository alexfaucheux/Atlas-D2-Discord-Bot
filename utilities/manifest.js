const stat = require('../manifest/Stat.json');
const trait = require('../manifest/Trait.json');
const vendor = require('../manifest/Vendor.json');
const charClass = require('../manifest/Class.json');
const activity = require('../manifest/Activity.json');
const vendorGroup = require('../manifest/Vendor.json');
const statGroup = require('../manifest/StatGroup.json');
const item = require('../manifest/InventoryItemLite.json');
const collectible = require('../manifest/Collectible.json');
const activityType = require('../manifest/ActivityType.json');
const itemBucket = require('../manifest/InventoryBucket.json');

module.exports = {
    getActivityType: (hash) => activityType[hash],
    getVenderGroup: (hash) => vendorGroup[hash],
    getCollectible: (hash) => collectible[hash],
    getItemBucket: (hash) => itemBucket[hash],
    getStatGroup: (hash) => statGroup[hash],
    getActivity: (hash) => activity[hash],
    getClass: (hash) => charClass[hash],
    getVendor: (hash) => vendor[hash],
    getTrait: (hash) => trait[hash],
    getItem: (hash) => item[hash],
    getStat: (hash) => stat[hash]
};
