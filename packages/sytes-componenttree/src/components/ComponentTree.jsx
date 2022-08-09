import React from 'react';
import { ComponentTreeCtx, ComponentTreeNode, useComponentTreeBuilder } from '../utils/component-tree';

class ComponentTreeBuilder {
    constructor() {
        this.stack = [];
        this.root = null;
    }

    beginNode = (type, props) => {
        if (this.root) {
            throw new Error('ComponentTree already created!');
        }
        this.stack.push(new ComponentTreeNode(type, props));
    }

    endNode = () => {
        const completedNode = this.stack.pop();
        if (!completedNode) {
            throw new Error('ComponentTree.EndNode has no matching ComponentTree.BeginNode!');
        }

        if (this.stack.length > 0) {
            const parentNode = this.stack[this.stack.length - 1];
            parentNode.children.push(completedNode);
        }
        else {
            this.root = completedNode;
        }
    }
}

const ComponentTree = ({rendering: RenderingComponent, rootType, children, ...restProps}) => {
    const treeBuilder = new ComponentTreeBuilder();
    return (
        <ComponentTreeCtx.Provider value={treeBuilder}>
            <ComponentTree.BeginNode type={rootType} props={restProps} />
                {children}
            <ComponentTree.EndNode />
            <RenderingComponent {...restProps} />
        </ComponentTreeCtx.Provider>
    );
}

ComponentTree.BeginNode = ({type, props}) => {
    useComponentTreeBuilder().beginNode(type, props);
    return null;
}

ComponentTree.EndNode = (props) => {
    useComponentTreeBuilder().endNode();
    return null;
}

export default ComponentTree;