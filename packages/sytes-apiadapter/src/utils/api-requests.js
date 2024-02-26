
export function getResource(resource) {
    return {
        type: 'get-resource',
        params: {
            resource: resource
        }
    }
}

export function getResourceByUrl(url) {
    return {
        type: 'get-resource',
        params: {
            url: url
        }
    }
}

export function storeResource(collection, newResource) {
    return {
        type: 'store-resource',
        params: {
            collection: collection,
            data: newResource
        }
    };
}

export function updateResource(resource, updatedResource) {
    return {
        type: 'update-resource',
        params: {
            resource: resource,
            data: updatedResource
        }
    };
}

export function updateResourceByUrl(url, updatedResource) {
    return {
        type: 'update-resource',
        params: {
            url: url,
            data: updatedResource
        }
    };
}

export function deleteResource(deletedResource) {
    return {
        type: 'delete-resource',
        params: {
            resource: deletedResource
        }
    };
}

export function uploadFileToResource(resource, procedure, file) {
    return {
        type: 'invoke-resource',
        params: {
            resource: resource,
            procedure: procedure,
            file: file
        }
    };
}

export function invokeResource(resource, procedure, data) {
    return {
        type: 'invoke-resource',
        params: {
            resource: resource,
            procedure: procedure,
            data: data
        }
    };
}
