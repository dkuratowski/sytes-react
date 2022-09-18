import { ComponentTreeNodeSearch, ComponentTreeNodeSearchByTypes, useComponentTree } from '@sytes/componenttree';

class FSMArrayItemDefinitionSearch extends ComponentTreeNodeSearch {
    constructor(dataItem) {
        super(
            node => node.type === 'fsm-array',
            node => node.type === 'item-definition' && node.props && node.props.condition && node.props.condition(dataItem)
        );
    }
}

class FSMArrayPropertyMappingSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('item-definition', 'property-mapping');
    }
}

class FSMArrayIdentifierMappingSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('item-definition', 'identifier-mapping');
    }
}

class FSMArrayStateMappingSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('item-definition', 'state-mapping');
    }
}

class FSMArrayRenderingSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('item-definition', 'rendering');
    }
}

class FSMArrayTransitionMappingSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('item-definition', 'transition-mapping');
    }
}

// By default any transition of the target item triggers the transition mapping.
function defaultTrigger(target, transition) {
    return target.item === transition.item;
}

// By default perform any transition triggered by the target item, and keep the current state if the transition is triggered by another item.
function defaultTransition(target, transition) {
    return target.item === transition.item ? [...transition.toState] : [...target.state];
}

function createItemDefinitionFromNode(node) {
    const propertyMappingSearch = new FSMArrayPropertyMappingSearch();
    const idMappingSearch = new FSMArrayIdentifierMappingSearch();
    const stateMappingSearch = new FSMArrayStateMappingSearch();
    const itemRenderingSearch = new FSMArrayRenderingSearch();
    const transitionMappingSearch = new FSMArrayTransitionMappingSearch();

    node.accept(propertyMappingSearch);
    node.accept(idMappingSearch);
    node.accept(stateMappingSearch);
    node.accept(itemRenderingSearch);
    node.accept(transitionMappingSearch);

    const propertyMappings = propertyMappingSearch.getResults().map(result => result.node);
    const idMappings = idMappingSearch.getResults().map(result => result.node);
    const stateMappings = stateMappingSearch.getResults().map(result => result.node);
    const itemRenderings = itemRenderingSearch.getResults().map(result => result.node);
    const transitionMappings = transitionMappingSearch.getResults().map(result => result.node);

    const itemDefinition = {};

    // Extracting the name from the item definition node.
    if (node.props && node.props.name) {
        itemDefinition.name = node.props.name;
    }

    // Extracting rendering from the component tree.
    if (itemRenderings && itemRenderings.length > 0) {
        itemDefinition.rendering = {};
        if (itemRenderings[0].props && itemRenderings[0].props.content && (!Array.isArray(itemRenderings[0].props.content) || itemRenderings[0].props.content.length > 0)) {
            itemDefinition.rendering.content = Array.isArray(itemRenderings[0].props.content) ? itemRenderings[0].props.content[0] : itemRenderings[0].props.content;
        }
    }

    // Extracting ID mapping from the component tree.
    if (idMappings && idMappings.length > 0 && idMappings[0].props && idMappings[0].props.mapping) {
        itemDefinition.idMapping = idMappings[0].props.mapping
    }

    // Extracting state mapping from the component tree.
    if (stateMappings && stateMappings.length > 0 && stateMappings[0].props && stateMappings[0].props.mapping) {
        itemDefinition.stateMapping = stateMappings[0].props.mapping
    }

    // Extracting property mappings from the component tree.
    itemDefinition.propertyMappings = propertyMappings.map(propMapping => {
        const propertyMappingDefinition = {};
        if (propMapping.props) {
            if (propMapping.props.targetProp) {
                propertyMappingDefinition.targetProp = propMapping.props.targetProp;
            }
            if (propMapping.props.mapping) {
                propertyMappingDefinition.mapping = propMapping.props.mapping;
            }
        }
        return propertyMappingDefinition;
    });

    // Extracting transition mappings from the component tree.
    itemDefinition.transitionMappings = transitionMappings.map(transMapping => {
        const transitionMappingDefinition = {
            triggers: [],
            transition: null,
            actions: []
        };
        if (transMapping.children) {
            transMapping.children.forEach(transMappingChild => {
                if (transMappingChild.type === 'trigger') {
                    if (transMappingChild.props && transMappingChild.props.trigger) {
                        transitionMappingDefinition.triggers.push(transMappingChild.props.trigger);
                    }
                } else if (transMappingChild.type == 'transition') {
                    if (transMappingChild.props && transMappingChild.props.transition) {
                        transitionMappingDefinition.transition = transMappingChild.props.transition;
                    }
                } else if (transMappingChild.type == 'action') {
                    if (transMappingChild.props && transMappingChild.props.action) {
                        transitionMappingDefinition.actions.push(transMappingChild.props.action);
                    }
                }
            });
        }

        // If no trigger defined for the transition mapping -> push the default trigger
        if (transitionMappingDefinition.triggers.length === 0) {
            transitionMappingDefinition.triggers.push(defaultTrigger);
        }

        // If no transition defined for the transition mapping -> set the default transition.
        if (transitionMappingDefinition.transition === null) {
            transitionMappingDefinition.transition = defaultTransition;
        }
        return transitionMappingDefinition;
    });

    // Use the default transition mapping as a fallback.
    itemDefinition.transitionMappings.push({
        triggers: [defaultTrigger],
        transition: defaultTransition,
        actions: []
    });

    return itemDefinition;
}

export function useItemDefinitions(dataItems, stateArray, renderFunction) {
    const fsmArrayTree = useComponentTree();

    // Create the item definitions.
    const itemDefinitionsByNode = [];
    dataItems.forEach(dataItem => {
        if (!stateArray.getItemDefinition(dataItem)) {
            // Item definition not yet saved for the data item.
            // Search the item definition node in the component tree that is satisfied by the data item.
            const itemDefinitionSearch = new FSMArrayItemDefinitionSearch(dataItem);
            fsmArrayTree.accept(itemDefinitionSearch);
            const itemDefinitionNodes = itemDefinitionSearch.getResults().map(result => result.node);
            if (itemDefinitionNodes.length > 0) {
                // Item definition node found for data item
                const itemDefinitionNode = itemDefinitionNodes[0];
                const itemDefinitionRecord = itemDefinitionsByNode.find(record => record.node === itemDefinitionNode);
                if (itemDefinitionRecord) {
                    // Item definition found for the node -> reuse.
                    stateArray.init(dataItem, itemDefinitionRecord.definition);
                } else {
                    // Item definition for the node doesn't exist yet -> create.
                    const itemDefinition = createItemDefinitionFromNode(itemDefinitionNode);
                    itemDefinitionsByNode.push({ node: itemDefinitionNode, definition: itemDefinition });
                    stateArray.init(dataItem, itemDefinition);
                }
            } else {
                // No item definition node found satisfied by the data item.
                stateArray.init(dataItem, null);
            }
        }
    });

    // Render the data items.
    return dataItems.map(dataItem => renderFunction(dataItem));
}