module.exports = {
    generateEndpointString
}

function generateEndpointString(endpoint) {
    let endpointStr = endpoint.path;
    const pathParams = endpoint.pathParams;
    const queryParams = endpoint.queryParams;

    for (const param in pathParams) {
        const paramObj = pathParams[param];

        if (paramObj.value === null) {
            // console.log(`[WARNING] No value specified for path param: ${param}. Using default value: ${paramObj.default}`);
            paramObj.value = paramObj.default;
        }

        if (paramObj.value === null) {
            throw new Error(`Path parameter ${param} needs a value.`)
        }

        endpointStr = endpointStr.replace(`{${param}}`, paramObj.value);
    }

    for (const param in queryParams) {
        const paramObj = queryParams[param];

        if (paramObj.value === null) {
            // console.log(`[WARNING] No value specified for query param: ${param}. Using default value: ${paramObj.default}`);
            paramObj.value = paramObj.default;
        }

        if (paramObj.value === null && paramObj.required) {
            throw new Error('Query parameter object needs a value')
        }

        endpointStr += !endpointStr.includes('?') ? '?' : '&';
        endpointStr += `${param}=${paramObj.value}`;
    }

    return endpointStr;
}