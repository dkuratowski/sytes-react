// =================================================================
// Request types
// =================================================================
export type Request = GetResourceRequest |
    GetResourceByUrlRequest |
    StoreResourceRequest |
    UpdateResourceRequest |
    UpdateResourceByUrlRequest |
    DeleteResourceRequest |
    UploadFileToResourceRequest |
    InvokeResourceRequest;

export type GetResourceRequest = { type: 'get-resource', params: { resource: ApiResource }};
export type GetResourceByUrlRequest = { type: 'get-resource', params: { url: string }};
export type StoreResourceRequest = { type: 'store-resource', params: { collection: ApiResource, data: ApiResource } }
export type UpdateResourceRequest = { type: 'update-resource', params: { resource: ApiResource, data: ApiResource } }
export type UpdateResourceByUrlRequest = { type: 'update-resource', params: { url: string, data: ApiResource } }
export type DeleteResourceRequest = { type: 'delete-resource', params: { resource: ApiResource } }
export type UploadFileToResourceRequest = { type: 'invoke-resource', params: { resource: ApiResource, procedure: string, file: File } }
export type InvokeResourceRequest = { type: 'invoke-resource', params: { resource: ApiResource, procedure: string, data: object } }



// =================================================================
// Events
// =================================================================
export type InitHandler = (name: string, initializedResource: ApiResource) => void;
export type StoreHandler = (collection: ApiResource, storedResource: ApiResource) => void;
export type GetHandler = (retrievedResource: ApiResource) => void;
export type UpdateHandler = (updatedResource: ApiResource) => void;
export type DeleteHandler = (deletedResource: ApiResource) => void;
export type InvokeHandler = (invokedResource: ApiResource, procedure: string, result: object) => void;
export type ErrorHandler = (request: Request, response: ApiResponse, status: number) => void;
export type CompleteHandler = (batches: Request[][]) => void;



// =================================================================
// API types
// =================================================================
export type ApiStatusInfo = {
    code: number,               // HTTP status code
    message?: string,           // HTTP status message
};

export type ApiResourceLinks = { [name: string]: string };

export type ApiMethod = 'post' | 'get' | 'put' | 'delete';

export type ApiFieldPolicy = {
    policy: string,
};

export type ApiResourceMetadata = {
    validation?: { [fieldName: string]: ApiFieldPolicy[] },
};

export type ApiMetadata = {
    methods?: ApiMethod[],
    resourceTypes?: { [resourceType: string]: ApiResourceMetadata },
};

export type ApiIdentifiers = { [name: string]: string };

export type ApiResourceRelations = { [name: string]: ApiResource };

export type ApiResource = {
    type?: string,
    apiLinks?: ApiResourceLinks,
    webLinks?: ApiResourceLinks,
    meta?: ApiMetadata,
    identifiers?: ApiIdentifiers,
    header?: object,
    body?: object,
    items?: ApiResource[],
    relations?: ApiResourceRelations,
};

export type ApiValidationError = {
    error: string,
    details?: { [fieldName: string]: ApiFieldPolicy[] },
};

export type ApiResponse = {
    status?: ApiStatusInfo,
    data?: ApiResource | ApiValidationError,
};

export type ApiError = {
    request: Request,
    response: ApiResponse,
    status: number,
};



// =================================================================
// API Client types
// =================================================================
export type ApiResponseHandler = (response: ApiResponse) => void;
export type ApiErrorHandler = (error: ApiError) => void

export type ApiRequestPayload = {
    data: ApiResource | object
}

export interface ApiClientPromise {
    then: (responseHandler: ApiResponseHandler) => ApiClientPromise,
    catch: (errorHandler: ApiErrorHandler) => void,
}

export interface ApiClient {
    get: (url: string) => ApiClientPromise,
    post: (url: string, payload: ApiRequestPayload) => ApiClientPromise,
    put: (url: string, payload: ApiRequestPayload) => ApiClientPromise,
    delete: (url: string) => ApiClientPromise,
    file: (url: string, file: File) => ApiClientPromise,
}



// =================================================================
// Internal types
// =================================================================
export type Job = {
    send: () => ApiClientPromise,
    receive: (response: ApiResponse) => void,
}

export type JobNotification = () => void;

export type ApiAdapterStatus = {
    jobBatchQueue: Job[][],                         // An array of job batches not yet sent to the backend.
    jobBatch: Job[],                            // The currently processed job batch that has already sent to the server but not yet finished.
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
    onInvoke?: InvokeHandler,
    onError?: ErrorHandler,
    onComplete?: CompleteHandler,
}

export type ApiAdapterInitProps = {
    name: string,
    url: string,
}
