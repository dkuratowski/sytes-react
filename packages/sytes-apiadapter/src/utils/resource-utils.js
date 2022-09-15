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
export function addDocumentResourceToResourceTree(rootResource, collectionResource, newResource) {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        if (rootResource === collectionResource) {
            return {
                ...rootResource,
                items: [
                    ...rootResource.items,
                    newResource
                ]
            };
        }
        else {
            const rootResourceCopy = {
                ...rootResource,
                items: [
                    ...rootResource.items
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
 * Replaces a given document resource in a resource tree based on its type and ID.
 * 
 * @param {*} rootResource The root of the resource tree in which the given document resource needs to be replaced.
 * @param {*} newResource The new version of the replaced document resource.
 * 
 * @returns The shallow copy of the resource tree if the document resource was found and replaced, otherwise false.
 */
export function replaceDocumentResourceInResourceTree(rootResource, newResource) {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const rootResourceCopy = {
            ...rootResource,
            items: [
                ...rootResource.items
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
 * Deletes a given document resource from a resource tree based on its type and ID.
 * 
 * @param {*} rootResource The root of the resource tree from which the given document resource needs to be deleted.
 * @param {*} deletedResource The document resource to be deleted.
 * 
 * @returns The shallow copy of the resource tree if the document resource was found and deleted, otherwise false.
 */
export function deleteDocumentResourceFromResourceTree(rootResource, deletedResource) {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const rootResourceCopy = {
            ...rootResource,
            items: [
                ...rootResource.items
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
 * Checks whether the given resources are both document resources with the same URI.
 * 
 * @param {*} resourceA The first resource.
 * @param {*} resourceB The second resource.
 * 
 * @returns True if the given resources are both document resources with the same URI, otherwise false.
 */
export function areTheSameDocumentResources(resourceA, resourceB) {
    // Determine equality based on the URIs of the 2 resources.
    return (
        'apiLinks' in resourceA && 'self' in resourceA.apiLinks &&
        'apiLinks' in resourceB && 'self' in resourceB.apiLinks &&
        resourceA.apiLinks.self === resourceB.apiLinks.self
    ) || (
        'webLinks' in resourceA && 'self' in resourceA.webLinks &&
        'webLinks' in resourceB && 'self' in resourceB.webLinks &&
        resourceA.webLinks.self === resourceB.webLinks.self
    )
}

// Internal methods
function addDocumentResourceToResourceTreeInternal(rootResource, collectionResource, newResource) {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const foundAndAdded = addDocumentResourceInArrayInternal(rootResource.items, collectionResource, newResource);
        if (foundAndAdded) {
            return true;
        }
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (rootResource.relations[relationName] === collectionResource) {
                rootResource.relations[relationName].items.push(newResource);
                return true;
            }
            const foundAndAdded = addDocumentResourceToResourceTreeInternal(rootResource.relations[relationName], collectionResource, newResource);
            if (foundAndAdded) {
                return true;
            }
        }
    }

    return false;
}

function addDocumentResourceInArrayInternal(array, collectionResource, newResource) {
    const collectionIdx = array.indexOf(collectionResource);
    if (collectionIdx !== -1) {
        array[collectionIdx].items.push(newResource);
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

function replaceDocumentResourceInResourceTreeInternal(rootResource, newResource) {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const foundAndReplaced = replaceDocumentResourceInArrayInternal(rootResource.items, newResource);
        if (foundAndReplaced) {
            return true;
        }
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (areTheSameDocumentResources(rootResource.relations[relationName], newResource))
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

function replaceDocumentResourceInArrayInternal(array, newResource) {
    const resourceIdx = array.findIndex(resourceItem => areTheSameDocumentResources(resourceItem, newResource));
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

function deleteDocumentResourceFromResourceTreeInternal(rootResource, deletedResource) {
    if (rootResource.type === 'collection' || rootResource.type === 'store') {
        const foundAndDeleted = deleteDocumentResourceFromArrayInternal(rootResource.items, deletedResource);
        if (foundAndDeleted) {
            return true;
        }
    }

    if (rootResource.relations) {
        for (const relationName in rootResource.relations) {
            if (areTheSameDocumentResources(rootResource.relations[relationName], deletedResource))
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

function deleteDocumentResourceFromArrayInternal(array, deletedResource) {
    const resourceIdx = array.findIndex(resourceItem => areTheSameDocumentResources(resourceItem, deletedResource));
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
