const { BUNGIE_API_KEY } = process.env;

export const standardHeaders = {
    'X-API-KEY': BUNGIE_API_KEY
};

export const htmlConfig = {
    headers: standardHeaders
};

export const endpoints = {
    getDestinyManifest: {
        method: 'get',
        path: '/Destiny2/Manifest/',
        pathParams: {},
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getBungieRewards: {
        method: 'get',
        path: '/Tokens/Rewards/BungieRewards',
        pathParams: {},
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getBungieNews: {
        method: 'get',
        path: '/Content/Rss/NewsArticles/{pageToken}/',
        pathParams: {
            pageToken: {
                default: 0
            }
        },
        queryParams: {
            contentFilter: {
                default: 'Destiny',
                required: false
            },
            includeBody: {
                default: true,
                required: false
            }
        },
        bodyProps: {},
        oauth: false
    },
    searchPlayerByName: {
        method: 'post',
        path: '/Destiny2/SearchDestinyPlayerByBungieName/{membershipType}/',
        pathParams: {
            membershipType: {
                default: 'All'
            }
        },
        queryParams: {},
        bodyProps: {
            displayName: {
                required: true
            },
            displayNameCode: {
                required: true
            }
        },
        oauth: false
    },
    getDestinyProfile: {
        method: 'get',
        path: '/Destiny2/{membershipType}/Profile/{destinyMembershipId}/',
        pathParams: {
            membershipType: {},
            destinyMembershipId: {}
        },
        queryParams: {
            components: {
                default: '100,200',
                required: true
            }
        },
        bodyProps: {},
        oauth: false
    },
    searchGroupByName: {
        method: 'post',
        path: '/GroupV2/NameV2/',
        pathParams: {},
        queryParams: {},
        bodyProps: {
            groupName: {
                required: true
            },
            groupType: {
                default: 1,
                required: true
            }
        },
        oauth: false
    },
    getGroupMembers: {
        method: 'get',
        path: '/GroupV2/{groupId}/Members/',
        pathParams: {
            groupId: {}
        },
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getPublicVendors: {
        method: 'get',
        path: '/Destiny2/Vendors/',
        pathParams: {},
        queryParams: {
            components: {
                default: '400,401,402',
                required: true
            }
        },
        bodyProps: {},
        oauth: false
    },
    getVendor: {
        method: 'get',
        path: '/Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/Vendors/{vendorHash}/',
        pathParams: {
            membershipType: {},
            destinyMembershipId: {},
            characterId: {},
            vendorHash: {}
        },
        queryParams: {
            components: {
                default: '400,401,402',
                required: true
            }
        },
        bodyProps: {},
        oauth: true
    },
    getVendors: {
        method: 'get',
        path: '/Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/Vendors/',
        pathParams: {
            membershipType: {},
            destinyMembershipId: {},
            characterId: {}
        },
        queryParams: {
            components: {
                default: '400,401,402',
                required: true
            },
            filter: {
                default: 1,
                required: false
            }
        },
        bodyProps: {},
        oauth: true
    },
    getUniqueWeaponHistory: {
        method: 'get',
        path: '/Destiny2/{membershipType}/Account/{destinyMembershipId}/Character/{characterId}/Stats/UniqueWeapons/',
        pathParams: {
            membershipType: {},
            destinyMembershipId: {},
            characterId: {}
        },
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getActivityHistory: {
        method: 'get',
        path: '/Destiny2/{membershipType}/Account/{destinyMembershipId}/Character/{characterId}/Stats/Activities/',
        pathParams: {
            membershipType: {},
            destinyMembershipId: {},
            characterId: {}
        },
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getCarnageReport: {
        method: 'get',
        path: '/Destiny2/Stats/PostGameCarnageReport/{activityId}/',
        pathParams: {
            activityId: {}
        },
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getUserById: {
        method: 'get',
        path: '/User/GetBungieNetUserById/{id}/',
        pathParams: {
            id: {}
        },
        queryParams: {},
        bodyProps: {},
        oauth: false
    },
    getCurrentUser: {
        method: 'get',
        path: '/User/GetMembershipsForCurrentUser/',
        pathParams: {},
        queryParams: {},
        bodyProps: {},
        oauth: true
    }
};
