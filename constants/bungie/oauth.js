const { BUNGIE_AUTH_ID, BUNGIE_AUTH_SECRET } = process.env;

export const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

export const htmlConfig = {
    headers: oauthHeaders
};

export const body = {
    client_id: BUNGIE_AUTH_ID,
    client_secret: BUNGIE_AUTH_SECRET
};

export const endpoints = {
    authorize: {
        method: 'get',
        path: oauthURI,
        pathParams: {},
        queryParams: {
            response_type: {
                default: 'code',
                required: true
            },
            client_id: {
                default: BUNGIE_AUTH_ID,
                required: true
            },
            redirect_uri: {
                required: true
            }
        },
        bodyProps: {},
        oauth: false
    },
    getOAuthToken: {
        method: 'get',
        path: oauthTokenURI,
        pathParams: {},
        queryParams: {},
        bodyProps: {},
        oauth: false
    }
};
