import React from 'react';
import { ComponentTree } from '@sytes/componenttree';
import { FSMArrayLocal } from './FSMArrayCluster';
import { useItemDefinitions } from '../utils/fsm-item-definitions';
import { useTransitionSubject } from '../utils/fsm-transition-subject';
import { useStateArray } from '../utils/fsm-state-array';

function transitionHandler(localDataItems, localStateArray) {
    return (transitionEvent) => {
        const targetObjects = localDataItems.map(targetItem => {
            return {
                item: targetItem,
                itemDefinition: localStateArray.getItemDefinition(targetItem),
                state: localStateArray.getState(targetItem)
            }
        });

        targetObjects.forEach(targetObject => {
            targetObject.itemDefinition.transitionMappings.every(transitionMapping => {
                if (transitionMapping.triggers.some(trigger => trigger(targetObject, transitionEvent))) {
                    // Execute the defined state transition
                    localStateArray.setState(targetObject.item, transitionMapping.transition(targetObject, transitionEvent));

                    // Execute the defined actions
                    transitionMapping.actions.forEach(action => action(targetObject, transitionEvent));

                    // Break the iteration on transition mappings.
                    return false;
                }

                // Continue the iteration on transition mappings.
                return true;
            });
        });

        // Save the state array at the end of the transition handler.
        localStateArray.saveIfUpdated();
    };
}

// FSMArray root element
const FSMArray = ({children, ...restProps}) => {
    // Provide a local transition subject anyway.
    return (
        <FSMArrayLocal>
            <ComponentTree rendering={FSMArrayRender} rootType='fsm-array' {...restProps}>
                {children}
            </ComponentTree>
        </FSMArrayLocal>
    );
}

// FSMArray rendering
const FSMArrayRender = ({dataItems, name}) => {
    const [transitionSubject, setTransitionHandler] = useTransitionSubject();
    const stateArray = useStateArray(dataItems, name);

    const renderedComponents = useItemDefinitions(dataItems, stateArray, (dataItem) => {
        const itemDefinition = stateArray.getItemDefinition(dataItem);
        if (itemDefinition && itemDefinition.rendering && itemDefinition.rendering.content && itemDefinition.idMapping && itemDefinition.stateMapping) {
            const newProps = { key: itemDefinition.idMapping(dataItem) };
            itemDefinition.propertyMappings.forEach(propMapping => newProps[propMapping.targetProp] = propMapping.mapping(dataItem));
            newProps.state = stateArray.getState(dataItem);

            // Emit a transition event to the transition subject when the data item initiates a transition.
            newProps.onTransition = (targetState, ...payload) => {
                const transitionEvent = {
                    item: dataItem,
                    itemDefinition: itemDefinition,
                    fromState: stateArray.getState(dataItem),
                    toState: targetState,
                    payload: payload,
                }
                transitionSubject.next(transitionEvent);
            };

            return React.cloneElement(itemDefinition.rendering.content, newProps);
        }
        else {
            return null;
        }
    });

    setTransitionHandler(transitionHandler(dataItems, stateArray));
    return <>{renderedComponents}</>;
}

// Elements of the FSMArray component tree
FSMArray.ItemDefinition = ({children, ...itemDefinitionProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='item-definition' props={itemDefinitionProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.Rendering = ({children, ...renderingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='rendering' props={{content: children, ...renderingProps}} />
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.PropertyMapping = ({children, ...propertyMappingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='property-mapping' props={propertyMappingProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.EventMapping = ({targetEvent, handler}) => {
    return (
        <FSMArray.PropertyMapping targetProp={targetEvent} mapping={dataItem => ((...eventPayload) => handler(dataItem, ...eventPayload))} />
    );
}

FSMArray.IdentifierMapping = ({children, ...idMappingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='identifier-mapping' props={idMappingProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.StateMapping = ({children, ...stateMappingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='state-mapping' props={stateMappingProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.TransitionMapping = ({children, ...transitionMappingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='transition-mapping' props={transitionMappingProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.Trigger = ({children, ...triggerProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='trigger' props={triggerProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.Transition = ({children, ...transitionProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='transition' props={transitionProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FSMArray.Action = ({children, ...actionProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='action' props={actionProps} />
            <ComponentTree.EndNode />
        </>
    );
}

export default FSMArray;
