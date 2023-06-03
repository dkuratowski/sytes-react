import React, { useEffect, useRef } from 'react';
import { ComponentTree, ComponentTreeNodeSearchByTypes, useComponentTree } from '@sytes/componenttree';

class InitializeNodeSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('api-adapter', 'initialize');
    }
}

const ApiAdapter = ({ children, ...restProps }) => {
    return (
        <ComponentTree rendering={ApiAdapterRender} rootType='api-adapter' {...restProps}>
            {children}
        </ComponentTree>
    );
}

function createQueueItem(httpClient, request, onCreate, onGet, onUpdate, onDelete, onInvoke) {
    if (request.type === 'store-resource') {
        return {
            send: () => httpClient.post(request.params.collection.apiLinks.self, { data: request.params.data }),
            receive: response => onCreate && onCreate(request.params.collection, response.data),
        }
    }
    else if (request.type === 'get-resource') {
        return {
            send: () => httpClient.get(request.params.resource.apiLinks.self),
            receive: response => onGet && onGet(response.data)
        }
    }
    else if (request.type === 'update-resource') {
        return {
            send: () => httpClient.put(request.params.resource.apiLinks.self, { data: request.params.data }),
            //send: () => httpClient.post(request.params.resource.apiLinks.self, { method: 'put', data: request.params.data }),
            receive: response => onUpdate && onUpdate(response.data),
        }
    }
    else if (request.type === 'delete-resource') {
        return {
            send: () => httpClient.delete(request.params.resource.apiLinks.self),
            //send: () => httpClient.post(request.params.resource.apiLinks.self, { method: 'delete' }),
            receive: response => onDelete && onDelete(request.params.resource),
        }
    }
    else if (request.type === 'invoke-resource') {
        if (request.params.data) {
            return {
                send: () => httpClient.post(request.params.resource.relations[request.params.procedure].apiLinks.self, { data: request.params.data }),
                receive: response => onInvoke && onInvoke(request.params.resource, request.params.procedure, response.data),
            }
        }
        else if (request.params.file) {
            return {
                send: () => httpClient.file(request.params.resource.relations[request.params.procedure].apiLinks.self, request.params.file),
                receive: response => onInvoke && onInvoke(request.params.resource, request.params.procedure, response.data),
            }
        }
        else {
            throw new Error('Invalid API request. Both request.params.data and request.params.file is missing.');
        }
    }
    else {
        throw new Error('Invalid API request. Unsupported type: ' + request.type);
    }
}

// TODO: check if this is OK with WPAPIWrapper as the httpClient.
function createErrorNotification(onError) {
    return (error) => {
        if (onError) {
            if (error.response) {
                onError('Server error: ', error.response.status);
            } else if (error.request) {
                onError('No response');
            } else {
                onError('Unknown error');
            }
        }
    }
}

function handleServerError(error, status) {
    status.errorNotification(error);
    status.faulted = true;
}

function handleRequestFinished(request, response, status) {
    // Ignore incoming responses if we are in faulted state.
    if (status.faulted) { return; }
    // Remove the request from the current request batch.
    status.requestBatch.splice(status.requestBatch.indexOf(request), 1);
    // Save the corresponding notification into the current notification batch.
    status.notificationBatch.push(() => request.receive(response));
    // If the current request batch has finished then push the notification batch into the notification batch queue.
    if (status.requestBatch.length === 0) {
        status.notificationBatchQueue.push(status.notificationBatch);
        status.notificationBatch = [];
        processQueue(status);
    }
}

function processQueue(status) {
    if (status.requestBatch.length > 0) {
        throw new Error('Invalid operation: calling processQueue is not allowed while requests are pending!');
    }

    // Gets the next request batch out of the queue 
    const requestBatch = status.requestBatchQueue.shift();
    if (requestBatch === undefined) {
        // If all request batch has finished, then send the notifications.
        status.notificationBatchQueue.forEach(notificationBatch => notificationBatch.forEach(notification => notification()));
        status.notificationBatchQueue = [];
        return;
    }

    // Save the batch and send each request of it.
    status.requestBatch = requestBatch;
    status.requestBatch.forEach(request =>
        request.send().then(response => handleRequestFinished(request, response, status))
            .catch(error => handleServerError(error, status))
    );
}

const ApiAdapterRender = ({ httpClient, requestBatches, onInit, onCreate, onGet, onUpdate, onDelete, onInvoke, onError }) => {
    // console.log('ApiAdapterRender');
    // console.log(requestBatches);

    const apiAdapterTree = useComponentTree();
    const statusRef = useRef({
        requestBatchQueue: [],          // An array of request batches not yet sent to the backend.
        requestBatch: [],               // The currently processed request batch that has already sent to the server but not yet finished.
        notificationBatch: [],          // The notifications of the currently processed batch that needs to be called once every batch has finished.
        notificationBatchQueue: [],     // An array of notification batches that are completely finished.
        errorNotification: createErrorNotification(onError),
        faulted: false
    });

    useEffect(() => {
        const initNodeSearch = new InitializeNodeSearch();
        apiAdapterTree.accept(initNodeSearch);
        const initNodes = initNodeSearch.getResults().map(result => result.node);

        const namesDefined = [];
        const initRequests = initNodes.map(initNode => {
            if (namesDefined.includes(initNode.props.name)) {
                throw new Error('Initial object with name \'' + initNode.props.name + '\' already exists!');
            }
            namesDefined.push(initNode.props.name);
            return {
                send: () => httpClient.get(initNode.props.url),
                receive: response => onInit && onInit(initNode.props.name, response.data),
            };
        });
        statusRef.current.requestBatchQueue.push(initRequests);
        processQueue(statusRef.current);
    }, []);

    useEffect(() => {
        // Ignore initial value.
        if (requestBatches === null) {
            return;
        }
        // Throw error if faulted.
        if (statusRef.current.faulted) {
            throw new Error('ApiAdapter in faulted state!');
        }
        // Throw error if previous batches not yet finished.
        if (requestBatches.length > 0 && (statusRef.current.requestBatchQueue.length > 0 || statusRef.current.requestBatch.length > 0)) {
            throw new Error('Previous requests not yet finished!');
        }

        const queueItems = requestBatches.map(batch => batch.map(request => createQueueItem(httpClient, request, onCreate, onGet, onUpdate, onDelete, onInvoke)));
        statusRef.current.requestBatchQueue.push(...queueItems);
        processQueue(statusRef.current);
    }, [requestBatches]);

    return null;
}

ApiAdapter.Initialize = ({ children, ...initializeProps }) => {
    return (
        <>
            <ComponentTree.BeginNode type='initialize' props={initializeProps} />
            <ComponentTree.EndNode />
        </>
    );
}

export default ApiAdapter;