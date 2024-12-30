import {
    DeleteResourceRequest,
    GetResourceByUrlRequest,
    GetResourceRequest,
    InvokeResourceRequest,
    ApiResource,
    StoreResourceRequest,
    UpdateResourceByUrlRequest,
    UpdateResourceRequest,
    UploadFileToResourceRequest,
    ApiCollectionResource,
    ApiDocumentResourceInput,
    ApiDocumentResource,
    ApiControllerResource
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

export function storeResource<TBody extends object | unknown = undefined>(
    collection: ApiCollectionResource,
    newResource: ApiDocumentResourceInput<TBody>,
): StoreResourceRequest<TBody> {
    return {
        type: 'store-resource',
        params: {
            collection: collection,
            data: newResource
        }
    };
}

export function updateResource<TBody extends object | unknown = undefined>(
    resource: ApiDocumentResource<TBody, unknown>,
    updatedResource: ApiDocumentResourceInput<TBody>,
): UpdateResourceRequest<TBody> {
    return {
        type: 'update-resource',
        params: {
            resource: resource,
            data: updatedResource
        }
    };
}

export function updateResourceByUrl<TBody extends object | unknown = undefined>(
    url: string,
    updatedResource: ApiDocumentResourceInput<TBody>
): UpdateResourceByUrlRequest<TBody> {
    return {
        type: 'update-resource',
        params: {
            url: url,
            data: updatedResource
        }
    };
}

export function deleteResource(deletedResource: ApiDocumentResource<unknown, unknown>): DeleteResourceRequest {
    return {
        type: 'delete-resource',
        params: {
            resource: deletedResource
        }
    };
}

export function uploadFileToResource(resource: ApiControllerResource, procedure: string, file: File): UploadFileToResourceRequest {
    return {
        type: 'invoke-resource',
        params: {
            resource: resource,
            procedure: procedure,
            file: file
        }
    };
}

export function invokeResource<TParams extends object | unknown = undefined>(
    resource: ApiControllerResource,
    procedure: string,
    data: TParams
): InvokeResourceRequest<TParams> {
    return {
        type: 'invoke-resource',
        params: {
            resource: resource,
            procedure: procedure,
            data: data
        }
    };
}
