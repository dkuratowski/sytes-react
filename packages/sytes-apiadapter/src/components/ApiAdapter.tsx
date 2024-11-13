import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { ComponentTree, ComponentTreeNodeSearchByTypes, useComponentTree } from '@sytes/componenttree';
import {
    ApiClient,
    Request,
    DeleteHandler,
    GetHandler,
    InvokeHandler,
    InvokeResourceRequest,
    StoreHandler,
    UpdateHandler,
    UploadFileToResourceRequest,
    Job,
    ApiAdapterStatus,
    ApiAdapterProps,
    ApiAdapterInitProps,
    ApiResource,
    CompleteHandler,
    ApiResourceRelations,
    ApiResponse,
    ApiResponseHandler,
    ErrorHandler,
} from '../types';

class InitializeNodeSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('api-adapter', 'initialize');
    }
}

const ApiAdapter = ({ children, ...props }: PropsWithChildren<ApiAdapterProps>) => {
    return (
        <ComponentTree rendering={ApiAdapterRender} rootType='api-adapter' {...props}>
            {children}
        </ComponentTree>
    );
}

function createJob(
    httpClient: ApiClient,
    request: Request,
    onStore?: StoreHandler,
    onGet?: GetHandler,
    onUpdate?: UpdateHandler,
    onDelete?: DeleteHandler,
    onInvoke?: InvokeHandler,
    onError?: ErrorHandler,
): Job | never {
    if (request.type === 'store-resource') {
        const collectionUrl: string | null = request.params.collection.apiLinks?.self ?? null;
        if (!collectionUrl) {
            throw new Error('Collection URL could not be retrieved');
        }

        return {
            request: request,
            send: () => httpClient.post(collectionUrl, { data: request.params.data }),
            receive: response => onStore && response.data && onStore(request.params.collection, response.data as ApiResource),
            error: error => onError && onError(error),
        };
    }
    else if (request.type === 'get-resource') {
        if ('resource' in request.params) {
            const resourceUrl: string | null = request.params.resource?.apiLinks?.self ?? null;
            if (!resourceUrl) {
                throw new Error('Resource URL could not be retrieved');
            }
    
            return {
                request: request,
                send: () => httpClient.get(resourceUrl),
                receive: response => onGet && response.data && onGet(response.data as ApiResource),
                error: error => onError && onError(error),
            };
        }
        else if ('url' in request.params) {
            const resourceUrl: string | null = request.params.url ?? null;
            if (!resourceUrl) {
                throw new Error('Resource URL could not be retrieved');
            }
    
            return {
                request: request,
                send: () => httpClient.get(resourceUrl),
                receive: response => onGet && response.data && onGet(response.data as ApiResource),
                error: error => onError && onError(error),
            };
        }
        else {
            throw new Error('Invalid API request. Both request.params.resource and request.params.url is missing.');
        }
    }
    else if (request.type === 'update-resource') {
        if ('resource' in request.params) {
            const resourceUrl: string | null = request.params.resource?.apiLinks?.self ?? null;
            if (!resourceUrl) {
                throw new Error('Resource URL could not be retrieved');
            }
    
            return {
                request: request,
                send: () => httpClient.put(resourceUrl, { data: request.params.data }),
                //send: () => httpClient.post(resourceUrl, { method: 'put', data: request.params.data }),
                receive: response => onUpdate && response.data && onUpdate(response.data as ApiResource),
                error: error => onError && onError(error),
            };
        }
        else if ('url' in request.params) {
            const resourceUrl: string | null = request.params.url ?? null;
            if (!resourceUrl) {
                throw new Error('Resource URL could not be retrieved');
            }
    
            return {
                request: request,
                send: () => httpClient.put(resourceUrl, { data: request.params.data }),
                //send: () => httpClient.post(resourceUrl, { method: 'put', data: request.params.data }),
                receive: response => onUpdate && response.data && onUpdate(response.data as ApiResource),
                error: error => onError && onError(error),
            };
        }
    }
    else if (request.type === 'delete-resource') {
        const resourceUrl: string | null = request.params.resource.apiLinks?.self ?? null;
        if (!resourceUrl) {
            throw new Error('Resource URL could not be retrieved');
        }

        return {
            request: request,
            send: () => httpClient.delete(resourceUrl),
            //send: () => httpClient.post(resourceUrl, { method: 'delete' }),
            receive: response => onDelete && onDelete(request.params.resource),
            error: error => onError && onError(error),
        };
    }
    else if (request.type === 'invoke-resource') {
        const resourceRelations: ApiResourceRelations | null = request.params.resource.relations ?? null;
        if (!resourceRelations) {
            throw new Error(`Controller resource for procedure '${request.params.procedure}' not found`);
        }

        const controllerResource: ApiResource | null = resourceRelations[request.params.procedure] ?? null;
        if (!controllerResource) {
            throw new Error(`Controller resource for procedure '${request.params.procedure}' not found`);
        }

        const procedureUrl: string | null = controllerResource.apiLinks?.self ?? null;
        if (!procedureUrl) {
            throw new Error(`Controller resource URL for procedure '${request.params.procedure}' could not be retrieved`);
        }

        if ('data' in request.params) {
            return {
                request: request,
                send: () => httpClient.post(procedureUrl, { data: (request as InvokeResourceRequest).params.data }),
                receive: response => onInvoke && response.data && onInvoke(request.params.resource, request.params.procedure, response.data),
                error: error => onError && onError(error),
            };
        }
        else if ('file' in request.params) {
            return {
                request: request,
                send: () => httpClient.file(procedureUrl, (request as UploadFileToResourceRequest).params.file),
                receive: response => onInvoke && response.data && onInvoke(request.params.resource, request.params.procedure, response.data),
                error: error => onError && onError(error),
            };
        }
        else {
            throw new Error('Invalid API request. Both request.params.data and request.params.file is missing.');
        }
    }

    throw new Error('Invalid API request. Unsupported type: ' + request.type);
}

function createCompleteJob(requestBatches: Request[][], onComplete?: CompleteHandler): Job {
    const completeJobPromise = {
        then: (responseHandler: ApiResponseHandler) => {
            // Execute the response handler immediatelly
            setTimeout(() => responseHandler({}));
            return completeJobPromise;
        },
        catch: () => { /* Do nothing */ },
    };

    return {
        request: null,
        send: () => completeJobPromise,
        receive: () => onComplete && onComplete(requestBatches),
        error: error => { throw new Error('Impossible case happened'); },
    };
}

function handleJobFailed(job: Job, response: ApiResponse | null, httpStatus: number | null, status: ApiAdapterStatus) {
    // Remove the job from the current job batch.
    status.jobBatch.splice(status.jobBatch.indexOf(job), 1);
    // Save the corresponding notification into the current notification batch.
    status.notificationBatch.push(() => job.error({
        request: job.request,
        response: response,
        httpStatus: httpStatus,
    }));

    // If the current request batch has finished then push the notification batch into the notification batch queue.
    if (status.jobBatch.length === 0) {
        status.notificationBatchQueue.push(status.notificationBatch);
        status.notificationBatch = [];
        processQueue(status);
    }
}

function handleJobSucceeded(job: Job, response: ApiResponse, status: ApiAdapterStatus) {
    // Remove the job from the current job batch.
    status.jobBatch.splice(status.jobBatch.indexOf(job), 1);
    // Save the corresponding notification into the current notification batch.
    status.notificationBatch.push(() => job.receive(response));

    // If the current request batch has finished then push the notification batch into the notification batch queue.
    if (status.jobBatch.length === 0) {
        status.notificationBatchQueue.push(status.notificationBatch);
        status.notificationBatch = [];
        processQueue(status);
    }
}

function processQueue(status: ApiAdapterStatus): void {
    if (status.jobBatch.length > 0) {
        throw new Error('Invalid operation: calling processQueue is not allowed while requests are pending!');
    }

    // Gets the next request batch out of the queue 
    const jobBatch = status.jobBatchQueue.shift();
    if (!jobBatch) {
        // If all request batch has finished, then send the notifications.
        status.notificationBatchQueue.forEach(
            notificationBatch => notificationBatch.forEach(
                notification => notification()
            )
        );
        status.notificationBatchQueue = [];
        return;
    }

    // Save the batch and send each request of it.
    status.jobBatch = jobBatch;
    status.jobBatch.forEach(job =>
        job.send()
           .then((response: ApiResponse) => handleJobSucceeded(job, response, status))
           .catch((response: ApiResponse | null, httpStatus: number | null) => handleJobFailed(job, response, httpStatus, status)),
    );
}

const ApiAdapterRender = ({
    httpClient,
    requestBatches,
    onInit,         // an init request (defined by an 'ApiAdapter.Initialize' component) has been completed
    onStore,        // a store request has been completed
    onGet,          // a get request has been completed
    onUpdate,       // an update request has been completed
    onDelete,       // a delete request has been completed
    onInvoke,       // an invoke request has been completed
    onError,        // a request has failed
    onComplete      // every request in the incoming request batches has been completed
}: ApiAdapterProps) => {
    const apiAdapterTree = useComponentTree();
    const statusRef = useRef<ApiAdapterStatus>({
        jobBatchQueue: [],
        jobBatch: [],
        notificationBatch: [],
        notificationBatchQueue: [],
    });

    useEffect(() => {
        const initNodeSearch = new InitializeNodeSearch();
        apiAdapterTree.accept(initNodeSearch);
        const initNodes = initNodeSearch.getResults().map(result => result.node);

        const namesDefined: string[] = [];
        const initJobBatch: Job[] = initNodes.map(initNode => {
            if (namesDefined.includes(initNode.props.name)) {
                throw new Error('Initial object with name \'' + initNode.props.name + '\' already exists!');
            }
            namesDefined.push(initNode.props.name);
            return {
                send: () => httpClient.get(initNode.props.url),
                receive: response => onInit && onInit(initNode.props.name, response.data as ApiResource),
            };
        });
        statusRef.current.jobBatchQueue.push(initJobBatch);
        processQueue(statusRef.current);
    }, []);

    useEffect(() => {
        // Ignore initial value.
        if (!requestBatches) {
            return;
        }
        
        // Throw error if previous batches not yet finished.
        if (requestBatches.length > 0 && (statusRef.current.jobBatchQueue.length > 0 || statusRef.current.jobBatch.length > 0)) {
            throw new Error('Previous requests not yet finished!');
        }

        const jobBatches: Job[][] = requestBatches.map(
            batch => batch.map(
                request => createJob(httpClient, request, onStore, onGet, onUpdate, onDelete, onInvoke, onError)
            )
        );
        jobBatches.push([createCompleteJob(requestBatches, onComplete)]);
        statusRef.current.jobBatchQueue.push(...jobBatches);
        processQueue(statusRef.current);
    }, [requestBatches]);

    return null;
}

ApiAdapter.Initialize = (initializeProps: ApiAdapterInitProps) => {
    return (
        <>
            <ComponentTree.BeginNode type='initialize' props={initializeProps} />
            <ComponentTree.EndNode />
        </>
    );
}

export default ApiAdapter;
