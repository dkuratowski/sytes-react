import React from 'react';
import { ComponentTree, ComponentTreeNodeSearchByTypes, useComponentTree } from '@sytes/componenttree';

class PopoverTargetSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('popover', 'target');
    }
}

class PopoverBoxSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('popover', 'box');
    }
}

const Popover = ({children, ...restProps}) => {
    return (
        <ComponentTree rendering={PopoverRendering} rootType='popover' {...restProps}>
            {children}
        </ComponentTree>
    );
}

const PopoverRendering = (props) => {    
    const popoverTree = useComponentTree();
    const targetSearch = new PopoverTargetSearch();
    const boxSearch = new PopoverBoxSearch();
    popoverTree.accept(targetSearch);
    popoverTree.accept(boxSearch);

    const targetNode = targetSearch.getResults().length > 0 ? targetSearch.getResults()[0].node : null;
    if (!targetNode) { throw new Error('Missing Popover.Target element!'); }
    
    const boxNode = boxSearch.getResults().length > 0 ? boxSearch.getResults()[0].node : null;
    if (!boxNode) { throw new Error('Missing Popover.Box element!'); }

    return (
        <div className="popover-target">
            <div>{targetNode.props.content}</div>
            <div className="popover show bs-popover-bottom popover-box">
                <div className="arrow popover-arrow"></div>
                <div className="popover-body">{boxNode.props.content}</div>
            </div>
        </div>
    );
}

Popover.Target = ({children, ...targetProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='target' props={{ content: children, ...targetProps}} />
            <ComponentTree.EndNode />
        </>
    )
}

Popover.Box = ({children, ...boxProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='box' props={{ content: children, ...boxProps}} />
            <ComponentTree.EndNode />
        </>
    )
}

export default Popover;