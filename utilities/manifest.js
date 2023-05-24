import stat from "../manifest/Stat.json";
import trait from "../manifest/Trait.json";
import vendor from "../manifest/Vendor.json";
import charClass from "../manifest/Class.json";
import activity from "../manifest/Activity.json";
import vendorGroup from "../manifest/Vendor.json";
import statGroup from "../manifest/StatGroup.json";
import item from "../manifest/InventoryItemLite.json";
import collectible from "../manifest/Collectible.json";
import activityType from "../manifest/ActivityType.json";
import itemBucket from "../manifest/InventoryBucket.json";

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
