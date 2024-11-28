// =================================================================
// Request types
// =================================================================
export type Request = GetResourceRequest |
    GetResourceByUrlRequest |
    StoreResourceRequest<unknown> |
    UpdateResourceRequest<unknown> |
    UpdateResourceByUrlRequest<unknown> |
    DeleteResourceRequest |
    UploadFileToResourceRequest |
    InvokeResourceRequest<unknown>;

export type GetResourceRequest = { type: 'get-resource', params: { resource: ApiResource }};
export type GetResourceByUrlRequest = { type: 'get-resource', params: { url: string }};
export type StoreResourceRequest<TBody extends object | unknown = undefined> = {
    type: 'store-resource',
    params: {
        collection: ApiCollectionResource,
        data: ApiDocumentResourceInput<TBody>
    }
};
export type UpdateResourceRequest<TBody extends object | unknown = undefined> = {
    type: 'update-resource',
    params: {
        resource: ApiDocumentResource<TBody, unknown>,
        data: ApiDocumentResourceInput<TBody>
    }
};
export type UpdateResourceByUrlRequest<TBody extends object | unknown = undefined> = {
    type: 'update-resource',
    params: {
        url: string,
        data: ApiDocumentResourceInput<TBody>
    }
};
export type DeleteResourceRequest = {
    type: 'delete-resource',
    params: {
        resource: ApiDocumentResource<unknown, unknown>
    }
};
export type UploadFileToResourceRequest = {
    type: 'invoke-resource',
    params: {
        resource: Exclude<ApiResource, ApiControllerResource>,
        procedure: string,
        file: File
    }
};
export type InvokeResourceRequest<TParams extends object | unknown = undefined> = {
    type: 'invoke-resource',
    params: {
        resource: Exclude<ApiResource, ApiControllerResource>,
        procedure: string,
        data: TParams
    }
};



// =================================================================
// Events
// =================================================================
export type InitHandler = (name: string, initializedResource: ApiResource) => void;
export type StoreHandler = (collection: ApiCollectionResource, storedResource: ApiDocumentResource<unknown, unknown>) => void;
export type GetHandler = (retrievedResource: ApiResource) => void;
export type UpdateHandler = (updatedResource: ApiDocumentResource<unknown, unknown>) => void;
export type DeleteHandler = (deletedResource: ApiDocumentResource<unknown, unknown>) => void;
export type InvokeHandler<TResult> = (invokedResource: Exclude<ApiResource, ApiControllerResource>, procedure: string, result: TResult) => void;
export type ErrorHandler = (error: ApiError) => void;
export type CompleteHandler = (batches: Request[][]) => void;



// =================================================================
// API types
// =================================================================
export type ApiStatusInfo = {
    code: number,               // HTTP status code
    message?: string,           // HTTP status message
};

export type ApiResourceLinks = { self: string } & { [name: string]: string };

export type ApiMethod = 'post' | 'get' | 'put' | 'delete';

export type ApiFieldPolicy = {
    policy: string,
};

export type ApiDocumentResourceTypeMetadata = {
    validation?: { [fieldName: string]: ApiFieldPolicy[] },
};

export type ApiControllerParametersMetadata = {
    validation?: { [fieldName: string]: ApiFieldPolicy[] },
};

export type ApiDocumentMetadata = {
    methods?: ('post' | 'get' | 'put' | 'delete')[],
    resourceTypes?: { [resourceType: string]: ApiDocumentResourceTypeMetadata },
};

export type ApiCollectionMetadata = {
    methods?: ('post' | 'get')[],
};

export type ApiStoreMetadata = {
    methods?: ('get')[],
};

export type ApiControllerMetadata = {
    methods?: ('post')[],
    parameters?: ApiControllerParametersMetadata,
};

export type ApiIdentifiers = { [name: string]: string };

export type ApiResourceRelations = { [name: string]: ApiResource };

export type ApiResource = ApiDocumentResource<unknown, unknown> | ApiCollectionResource | ApiStoreResource | ApiControllerResource;

export type ApiDocumentResource<
    TBody extends object | unknown = undefined,
    THeader extends object | unknown = undefined,
> = {
    type?: Exclude<string, 'collection' | 'store' | 'controller'>,
    apiLinks?: ApiResourceLinks,
    webLinks?: ApiResourceLinks,
    meta?: ApiDocumentMetadata,
    identifiers?: ApiIdentifiers,
    header?: THeader,
    body?: TBody,
    relations?: ApiResourceRelations,
};

export type ApiDocumentResourceInput<TBody extends object | unknown = undefined> = {
    type: Exclude<string, 'collection' | 'store' | 'controller'>,
    body?: TBody,
};

export type ApiCollectionResource = {
    type: 'collection',
    apiLinks?: ApiResourceLinks,
    webLinks?: ApiResourceLinks,
    meta?: ApiCollectionMetadata,
    items: ApiDocumentResource<unknown, unknown>[],
}

export type ApiStoreResource = {
    type: 'store',
    apiLinks?: ApiResourceLinks,
    webLinks?: ApiResourceLinks,
    meta?: ApiStoreMetadata,
    items: ApiDocumentResource<unknown, unknown>[],
}

export type ApiControllerResource = {
    type: 'controller',
    apiLinks?: ApiResourceLinks,
    webLinks?: ApiResourceLinks,
    meta?: ApiControllerMetadata,
}

export type ApiValidationError = {
    error: string,
    details?: { [fieldName: string]: ApiFieldPolicy[] },
};

export type ApiResponse<TResult extends object | unknown = undefined> = {
    status?: ApiStatusInfo,
    data?: TResult,
};

export type ApiDocumentResourceResponse<
    TBody extends object | unknown = undefined,
    THeader extends object | unknown = undefined,
> = ApiResponse<ApiDocumentResource<TBody, THeader>>;

export type ApiError = {
    request: Request | null,        // The original request or null if there was no request input
    response: ApiResponse<ApiValidationError> | null,   // The response content or null if there was no response content
    httpStatus: number | null,      // The HTTP status code returned from the server or null in case of unknown error
};



// =================================================================
// API Client types
// =================================================================
export type ApiResponseHandler = (response: ApiResponse<unknown>) => void;
export type ApiErrorHandler = (response: ApiResponse<unknown> | null, httpStatus: number | null) => void

export type ApiRequestPayload<TPayload extends object | unknown = undefined> = {
    data: TPayload
}

export interface ApiClientPromise {
    then: (responseHandler: ApiResponseHandler) => ApiClientPromise,
    catch: (errorHandler: ApiErrorHandler) => void,
}

export interface ApiClient {
    get: (url: string) => ApiClientPromise,
    post: (url: string, payload: ApiRequestPayload<unknown>) => ApiClientPromise,
    put: (url: string, payload: ApiRequestPayload<unknown>) => ApiClientPromise,
    delete: (url: string) => ApiClientPromise,
    file: (url: string, file: File) => ApiClientPromise,
}



// =================================================================
// Internal types
// =================================================================
export type Job = {
    request: Request | null,                    // The original request or null if this is an init or complete job
    send: () => ApiClientPromise,               // The function for sending the request
    receive: (response: ApiResponse<unknown>) => void,   // The function for receiving the response
    error: (error: ApiError) => void,           // The function for handling errors
}

export type JobNotification = () => void;

export type ApiAdapterStatus = {
    jobBatchQueue: Job[][],                         // An array of job batches not yet sent to the backend.
    jobBatch: Job[],                                // The currently processed job batch that has already sent to the server but not yet finished.
    notificationBatch: JobNotification[],           // The notifications of the currently processed batch that needs to be called once every batch has finished.
    notificationBatchQueue: JobNotification[][],    // An array of notification batches that are completely finished.
};

export type ApiAdapterProps = {
    httpClient: ApiClient,
    requestBatches?: Request[][],
    onInit?: InitHandler,
    onStore?: StoreHandler,
    onGet?: GetHandler,
    onUpdate?: UpdateHandler,
    onDelete?: DeleteHandler,
    onInvoke?: InvokeHandler<unknown>,
    onError?: ErrorHandler,
    onComplete?: CompleteHandler,
}

export type ApiAdapterInitProps = {
    name: string,
    url: string,
}
