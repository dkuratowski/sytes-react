import React from 'react';
import { ComponentTree } from '@sytes/componenttree';

const FrontendPart = ({children, ...partProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='part' props={partProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendPart.PropertyConnector = (propertyConnectorProps) => {
    return (
        <>
            <ComponentTree.BeginNode type='property-connector' props={propertyConnectorProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendPart.EventConnector = (eventConnectorProps) => {
    return (
        <>
            <ComponentTree.BeginNode type='event-connector' props={eventConnectorProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendPart.Rendering = ({children, ...renderingProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='rendering' props={{content: children, ...renderingProps}} />
            <ComponentTree.EndNode />
        </>
    );
}

export default FrontendPart;
