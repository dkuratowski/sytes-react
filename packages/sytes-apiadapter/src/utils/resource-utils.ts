import { ApiResource } from "../types";

/**
 * Finds a document resource in a resource tree based on its URI.
 * 
 * @param {*} rootResource The root of the resource tree from which the given document resource needs to be found.
 * @param {*} uri The URI of the document resource to be found.
 * 
 * @returns The found document resource or null if not found.
 */
export function findDocumentResourceInResourceTreeByUri(rootResource: ApiResource, uri: string): ApiResource | null {
    return findDocumentResourceInResourceTreeByUriInternal(rootResource, uri);
}

/**
 * Adds the given document resource to the given collection resource in a resource tree.
 * 
 * @param {*} rootResource The root of the resource tree in which the given document resource needs to be added to the given collection resource.
 * @param {*} collectionResource The given collection resource.
 * @param {*} newResource The document resource to be added.
 * 
 * @returns The shallow copy of the resource tree if the collection resource was found and the document resource was added to that collection resource,
 *          otherwise null.
 */
export function addDocumentResourceToResourceTree(rootResource: ApiResource, collectionResource: ApiResource, newResource: ApiResource): ApiResource | null {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        if (rootResource === collectionResource) {
            return {
                ...rootResource,
                items: [
                    ...(rootResource.items ?? []),
                    newResource
                ]
            };
        }
        else {
            const rootResourceCopy = {
                ...rootResource,
                items: [
                    ...(rootResource.items ?? [])
                ]
            };

            const foundAndAdded = addDocumentResourceToResourceTreeInternal(rootResourceCopy, collectionResource, newResource);
            return foundAndAdded ? rootResourceCopy : null;
        }
    }
    else {
        const rootResourceCopy = {
            ...rootResource
        };

        const foundAndAdded = addDocumentResourceToResourceTreeInternal(rootResourceCopy, collectionResource, newResource);
        return foundAndAdded ? rootResourceCopy : null;
    }
}

/**
 * Replaces a given document resource in a resource tree based on its URI.
 * 
 * @param {*} rootResource The root of the resource tree in which the given document resource needs to be replaced.
 * @param {*} newResource The new version of the replaced document resource.
 * 
 * @returns The shallow copy of the resource tree if the document resource was found and replaced, otherwise null.
 */
export function replaceDocumentResourceInResourceTree(rootResource: ApiResource, newResource: ApiResource): ApiResource | null {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const rootResourceCopy = {
            ...rootResource,
            items: [
                ...(rootResource.items ?? [])
            ]
        };
        const foundAndReplaced = replaceDocumentResourceInResourceTreeInternal(rootResourceCopy, newResource);
        return foundAndReplaced ? rootResourceCopy : null;
    }
    else {
        const rootResourceCopy = {
            ...rootResource
        };
        const foundAndReplaced = replaceDocumentResourceInResourceTreeInternal(rootResourceCopy, newResource);
        return foundAndReplaced ? rootResourceCopy : null;
    }
}

/**
 * Deletes a given document resource from a resource tree based on its URI.
 * 
 * @param {*} rootResource The root of the resource tree from which the given document resource needs to be deleted.
 * @param {*} deletedResource The document resource to be deleted.
 * 
 * @returns The shallow copy of the resource tree if the document resource was found and deleted, otherwise null.
 */
export function deleteDocumentResourceFromResourceTree(rootResource: ApiResource, deletedResource: ApiResource): ApiResource | null {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const rootResourceCopy = {
            ...rootResource,
            items: [
                ...(rootResource.items ?? [])
            ]
        };
        const foundAndDeleted = deleteDocumentResourceFromResourceTreeInternal(rootResourceCopy, deletedResource);
        return foundAndDeleted ? rootResourceCopy : null;
    }
    else {
        const rootResourceCopy = {
            ...rootResource
        };
        const foundAndDeleted = deleteDocumentResourceFromResourceTreeInternal(rootResourceCopy, deletedResource);
        return foundAndDeleted ? rootResourceCopy : null;
    }
}

/**
 * Checks whether the given resources have the same URI.
 * 
 * @param {*} resourceA The first resource.
 * @param {*} resourceB The second resource.
 * 
 * @returns True if the given resources have the same URI, otherwise false.
 */
export function compareResourcesByUri(resourceA: ApiResource, resourceB: ApiResource): boolean {
    return (
        !!resourceA.apiLinks?.self && !!resourceB.apiLinks?.self &&
        resourceA.apiLinks.self === resourceB.apiLinks.self
    ) || (
        !!resourceA.webLinks?.self && !!resourceB.webLinks?.self &&
        resourceA.webLinks.self === resourceB.webLinks.self
    );
}

export function compareResourceUri(resource: ApiResource, uri: string): boolean {
    return (!!resource.apiLinks?.self && resource.apiLinks.self === uri) ||
        (!!resource.webLinks?.self && resource.webLinks.self === uri);
}

// Internal methods
function findDocumentResourceInResourceTreeByUriInternal(rootResource: ApiResource, uri: string): ApiResource | null {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        if (!rootResource.items) {
            rootResource.items = [];
        }
        return findDocumentResourceInArrayByUriInternal(rootResource.items, uri);
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (compareResourceUri(rootResource.relations[relationName], uri))
            {
                return rootResource.relations[relationName];
            }

            return findDocumentResourceInResourceTreeByUriInternal(rootResource.relations[relationName], uri);
        }
    }

    return null;
}

function findDocumentResourceInArrayByUriInternal(array: ApiResource[], uri: string): ApiResource | null {
    const resourceIdx = array.findIndex(resourceItem => compareResourceUri(resourceItem, uri));
    if (resourceIdx !== -1) {
        return array[resourceIdx];
    }

    for (let i = 0; i < array.length; i++) {
        return findDocumentResourceInResourceTreeByUriInternal(array[i], uri);
    }

    return null;
}

function addDocumentResourceToResourceTreeInternal(rootResource: ApiResource, collectionResource: ApiResource, newResource: ApiResource): boolean {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        if (!rootResource.items) {
            rootResource.items = [];
        }
        const foundAndAdded = addDocumentResourceInArrayInternal(rootResource.items, collectionResource, newResource);
        if (foundAndAdded) {
            return true;
        }
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (rootResource.relations[relationName] === collectionResource) {
                if (!collectionResource.items) {
                    collectionResource.items = [];
                }
                collectionResource.items.push(newResource);
                return true;
            }
            const foundAndAdded = addDocumentResourceToResourceTreeInternal(collectionResource, collectionResource, newResource);
            if (foundAndAdded) {
                return true;
            }
        }
    }

    return false;
}

function addDocumentResourceInArrayInternal(array: ApiResource[], collectionResource: ApiResource, newResource: ApiResource): boolean {
    const collectionIdx = array.indexOf(collectionResource);
    if (collectionIdx !== -1) {
        if (!collectionResource.items) {
            collectionResource.items = [];
        }
        collectionResource.items.push(newResource);
        return true;
    }

    for (let i = 0; i < array.length; i++) {
        const foundAndAdded = addDocumentResourceToResourceTreeInternal(array[i], collectionResource, newResource);
        if (foundAndAdded) {
            return true;
        }        
    }

    return false;
}

function replaceDocumentResourceInResourceTreeInternal(rootResource: ApiResource, newResource: ApiResource): boolean {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        if (!rootResource.items) {
            rootResource.items = [];
        }
        const foundAndReplaced = replaceDocumentResourceInArrayInternal(rootResource.items, newResource);
        if (foundAndReplaced) {
            return true;
        }
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (compareResourcesByUri(rootResource.relations[relationName], newResource))
            {
                rootResource.relations[relationName] = newResource;
                return true;
            }
            const foundAndReplaced = replaceDocumentResourceInResourceTreeInternal(rootResource.relations[relationName], newResource);
            if (foundAndReplaced) {
                return true;
            }
        }
    }

    return false;
}

function replaceDocumentResourceInArrayInternal(array: ApiResource[], newResource: ApiResource): boolean {
    const resourceIdx = array.findIndex(resourceItem => compareResourcesByUri(resourceItem, newResource));
    if (resourceIdx !== -1) {
        array.splice(resourceIdx, 1, newResource);
        return true;
    }

    for (let i = 0; i < array.length; i++) {
        const foundAndReplaced = replaceDocumentResourceInResourceTreeInternal(array[i], newResource);
        if (foundAndReplaced) {
            return true;
        }        
    }

    return false;
}

function deleteDocumentResourceFromResourceTreeInternal(rootResource: ApiResource, deletedResource: ApiResource): boolean {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        if (!rootResource.items) {
            rootResource.items = [];
        }
        const foundAndDeleted = deleteDocumentResourceFromArrayInternal(rootResource.items, deletedResource);
        if (foundAndDeleted) {
            return true;
        }
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (compareResourcesByUri(rootResource.relations[relationName], deletedResource))
            {
                delete rootResource.relations[relationName];
                return true;
            }
            const foundAndDeleted = deleteDocumentResourceFromResourceTreeInternal(rootResource.relations[relationName], deletedResource);
            if (foundAndDeleted) {
                return true;
            }
        }
    }

    return false;
}

function deleteDocumentResourceFromArrayInternal(array: ApiResource[], deletedResource: ApiResource): boolean {
    const resourceIdx = array.findIndex(resourceItem => compareResourcesByUri(resourceItem, deletedResource));
    if (resourceIdx !== -1) {
        array.splice(resourceIdx, 1);
        return true;
    }

    for (let i = 0; i < array.length; i++) {
        const foundAndReplaced = deleteDocumentResourceFromResourceTreeInternal(array[i], deletedResource);
        if (foundAndReplaced) {
            return true;
        }        
    }

    return false;
}
