export {
    default as ApiAdapter,
} from './components/ApiAdapter';

export {
    findDocumentResourceInResourceTreeByUri,
    addDocumentResourceToResourceTree,
    replaceDocumentResourceInResourceTree,
    deleteDocumentResourceFromResourceTree,
    compareResourcesByUri,
    compareResourceUri,
} from './utils/resource-utils';

export {
    getResource,
    getResourceByUrl,
    storeResource,
    updateResource,
    updateResourceByUrl,
    deleteResource,
    uploadFileToResource,
    invokeResource,
} from './utils/api-requests';

export {
    type Request,
    type GetResourceRequest,
    type GetResourceByUrlRequest,
    type StoreResourceRequest,
    type UpdateResourceRequest,
    type UpdateResourceByUrlRequest,
    type DeleteResourceRequest,
    type UploadFileToResourceRequest,
    type InvokeResourceRequest,

    type InitHandler,
    type StoreHandler,
    type GetHandler,
    type UpdateHandler,
    type DeleteHandler,
    type InvokeHandler,
    type ErrorHandler,
    type CompleteHandler,
    
    type ApiStatusInfo,
    type ApiResourceLinks,
    type ApiMethod,
    type ApiFieldPolicy,
    type ApiResourceMetadata,
    type ApiMetadata,
    type ApiIdentifiers,
    type ApiResourceRelations,
    type ApiResource,
    type ApiValidationError,
    type ApiResponse,
    type ApiError,

    type ApiResponseHandler,
    type ApiErrorHandler,
    type ApiRequestPayload,
    type ApiClientPromise,
    type ApiClient,
} from './types';
