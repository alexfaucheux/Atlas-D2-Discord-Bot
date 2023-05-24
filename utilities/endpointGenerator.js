export function generateEndpoint(endpoint) {
    const { bodyProps, pathParams, queryParams } = endpoint;
    const returnObj = {};
    const body = {};
    
    let endpointStr = endpoint.path;
    for (const param in pathParams) {
        const paramObj = pathParams[param];

        if (paramObj.value === null) {
            // console.log(`[WARNING] No value specified for path param: ${param}. Using default value: ${paramObj.default}`);
            paramObj.value = paramObj.default;
        }

        if (paramObj.value === null) {
            throw new Error(`Path parameter ${param} needs a value.`);
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
            throw new Error(`Query parameter ${param} needs a value.`);
        }

        endpointStr += !endpointStr.includes('?') ? '?' : '&';
        endpointStr += `${param}=${paramObj.value}`;
    }

    for (const prop in bodyProps) {
        const propObj = bodyProps[prop];

        if (propObj.value === null) {
            propObj.value = propObj.default;
        }

        if (propObj.value === null && propObj.required) {
            throw new Error(`Body property ${prop} needs a value.`);
        }

        body[prop] = propObj.value;
    }

    returnObj.path = endpointStr;
    returnObj.body = body;
    return returnObj;
}
