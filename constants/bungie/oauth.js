import urls from './uri.js';
const { BUNGIE_AUTH_ID, BUNGIE_AUTH_SECRET, BUNGIE_API_KEY } = process.env;

export const tokenHeader = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

export const htmlConfig = {
    headers: {
        ...tokenHeader,
        'X-API-KEY': BUNGIE_API_KEY
    }
};

export const tokenBody = {
    client_id: BUNGIE_AUTH_ID,
    client_secret: BUNGIE_AUTH_SECRET
};

export const getAuthHeader = (accessToken) => {
    return {
        'Authorization': 'Bearer ' + accessToken,
        ...htmlConfig.headers
    }
}

export const getAxiosAuthHeader = (accessToken) => {
    const authHeader = getAuthHeader(accessToken);
    return {
        headers: authHeader
    }
}

export const endpoints = {
    authorize: {
        method: 'get',
        path: urls.oauth,
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
        path: urls.oauthToken,
        pathParams: {},
        queryParams: {},
        bodyProps: {},
        oauth: false
    }
};