import React from 'react';
import { ComponentTree, useComponentTree } from '@sytes/componenttree';
import { FSMRenderingSearch, FSMTransitionSearch } from '../utils/fsm-search';

const FSM = ({children, ...restProps}) => {
    return (
        <ComponentTree rendering={FSMRender} rootType='fsm' {...restProps}>
            {children}
        </ComponentTree>
    );
}

const FSMRender = ({state, onTransition}) => {
    const fsmTree = useComponentTree();
    const transitionSearch = new FSMTransitionSearch(state);
    const renderingSearch = new FSMRenderingSearch(state);
    fsmTree.accept(transitionSearch);
    fsmTree.accept(renderingSearch);

    const renderings = renderingSearch.getResults().map(result => result.node);
    const transitions = transitionSearch.getResults().map(result => result.node);

    if (renderings && renderings.length > 0) {
        const rendering = renderings[0];
        if (rendering.props.content && (!Array.isArray(rendering.props.content) || rendering.props.content.length > 0)) {
            const renderedContent = Array.isArray(rendering.props.content) ? rendering.props.content[0] : rendering.props.content;
            const newProps = {};
            transitions.forEach(transition => {
                newProps[transition.props.trigger] = (...payload) => {
                    if (onTransition) {
                        const convertedPayload = transition.props.payloadConverter ? transition.props.payloadConverter(...payload) : [];
                        onTransition(transition.props.targetState, ...convertedPayload);
                    }
                }
            });
            return React.cloneElement(renderedContent, newProps);
        }
    }
    return null;
}

FSM.State = ({children, ...stateProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='state' props={stateProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FSM.Transition = ({children, ...transitionProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='transition' props={{content: children, ...transitionProps}} />
            <ComponentTree.EndNode />
        </>
    );
}

FSM.Rendering = ({children, ...renderingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='rendering' props={{content: children, ...renderingProps}} />
            <ComponentTree.EndNode />
        </>
    );
}

export default FSM;