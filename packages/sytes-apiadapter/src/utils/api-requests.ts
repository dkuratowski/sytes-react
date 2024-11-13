import {
    DeleteResourceRequest,
    GetResourceByUrlRequest,
    GetResourceRequest,
    InvokeResourceRequest,
    ApiResource,
    StoreResourceRequest,
    UpdateResourceByUrlRequest,
    UpdateResourceRequest,
    UploadFileToResourceRequest
} from "../types";

export function getResource(resource: ApiResource): GetResourceRequest {
    return {
        type: 'get-resource',
        params: {
            resource: resource
        }
    }
}

export function getResourceByUrl(url: string): GetResourceByUrlRequest {
    return {
        type: 'get-resource',
        params: {
            url: url
        }
    }
}

export function storeResource(collection: ApiResource, newResource: ApiResource): StoreResourceRequest {
    return {
        type: 'store-resource',
        params: {
            collection: collection,
            data: newResource
        }
    };
}

export function updateResource(resource: ApiResource, updatedResource: ApiResource): UpdateResourceRequest {
    return {
        type: 'update-resource',
        params: {
            resource: resource,
            data: updatedResource
        }
    };
}

export function updateResourceByUrl(url: string, updatedResource: ApiResource): UpdateResourceByUrlRequest {
    return {
        type: 'update-resource',
        params: {
            url: url,
            data: updatedResource
        }
    };
}

export function deleteResource(deletedResource: ApiResource): DeleteResourceRequest {
    return {
        type: 'delete-resource',
        params: {
            resource: deletedResource
        }
    };
}

export function uploadFileToResource(resource: ApiResource, procedure: string, file: File): UploadFileToResourceRequest {
    return {
        type: 'invoke-resource',
        params: {
            resource: resource,
            procedure: procedure,
            file: file
        }
    };
}

export function invokeResource(resource: ApiResource, procedure: string, data: object): InvokeResourceRequest {
    return {
        type: 'invoke-resource',
        params: {
            resource: resource,
            procedure: procedure,
            data: data
        }
    };
}
