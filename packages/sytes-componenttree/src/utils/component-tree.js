import { createContext, useContext } from "react";

export class ComponentTreeNode {
    constructor(type, props) {
        this.type = type ? type : null;
        this.props = props ? props : [];
        this.children = [];
    }

    accept = (visitor, parentPath = []) => {
        if (!Array.isArray(parentPath)) { throw new Error("The 'parentPath' parameter shall be an array!"); }

        if (visitor.visit) { visitor.visit(this, [...parentPath]); }
        this.children.forEach(childNode => childNode.accept(visitor, [...parentPath, this]));
        if (visitor.leave) { visitor.leave(this, [...parentPath]); }
    }
}

export class ComponentTreeLogger {
    visit = (node, parentPath) => {
        console.log(parentPath);
    }
}

export class ComponentTreeNodeSearch {
    constructor(...pathPredicates) {
        this.pathPredicates = pathPredicates;
        this.searchResults = [];
    }

    visit = (node, parentPath) => {
        const path = [...parentPath, node];
        if (path.length === this.pathPredicates.length &&
            path.every((nodeOnPath, idx) => this.pathPredicates[idx](nodeOnPath))) {
            this.searchResults.push({ node: node, parentPath: parentPath });
        }
    }

    getResults = () => this.searchResults;
}

export class ComponentTreeNodeSearchByTypes extends ComponentTreeNodeSearch {
    constructor(...nodeTypes) {
        super(...nodeTypes.map(type => (node => node.type === type)));
    }
}

export const ComponentTreeCtx = createContext(null);

export function useComponentTreeBuilder() {
    const componentTreeBuilder = useContext(ComponentTreeCtx);
    if (!componentTreeBuilder) { throw new Error('ComponentTree context not found!'); }
    return componentTreeBuilder;
}

export function useComponentTree() {
    const componentTreeRoot = useComponentTreeBuilder().root;
    if (!componentTreeRoot) { throw new Error('ComponentTree not yet created!'); }
    return componentTreeRoot;
}