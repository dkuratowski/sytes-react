import React from 'react';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { ComponentTree, useComponentTree } from '@sytes/componenttree';
import {
    FrontendPartEventConnectorSearch,
    FrontendPartPropertyConnectorSearch,
    FrontendPartRenderingSearch,
    FrontendPartSearch,
    FrontendStreamSearch
} from '../utils/frontend-module';
import { FrontendStreamBuilder } from '../utils/frontend-stream-builder';

const FrontendModule = ({children, ...restProps}) => {
    return (
        <ComponentTree rendering={FrontendModuleRender} rootType='frontend-module' {...restProps}>
            {children}
        </ComponentTree>
    );
}

const FrontendModuleRender = () => {
    const frontendModuleTree = useComponentTree();
    const streamSearch = new FrontendStreamSearch();
    const partSearch = new FrontendPartSearch();
    frontendModuleTree.accept(streamSearch);
    frontendModuleTree.accept(partSearch);

    const streamNodes = streamSearch.getResults().map(result => result.node);
    const streams = {};
    streamNodes.forEach(streamNode => {
        const streamBuilder = new FrontendStreamBuilder();
        streamNode.accept(streamBuilder);
        if (streamBuilder.stream && streamBuilder.stream.name) {
            if (streamBuilder.stream.name in streams) {
                throw new Error('Stream with name \'' + streamBuilder.stream.name + '\' already exists!');
            }
            streams[streamBuilder.stream.name] = streamBuilder.stream;
        }
    });

    // Render the frontend parts.
    const partNodes = partSearch.getResults().map(result => result.node);
    const renderedParts = partNodes.map(partNode => {
        const renderingSearch = new FrontendPartRenderingSearch();
        const propertyConnectorSearch = new FrontendPartPropertyConnectorSearch();
        const eventConnectorSearch = new FrontendPartEventConnectorSearch();
        partNode.accept(renderingSearch);
        partNode.accept(propertyConnectorSearch);
        partNode.accept(eventConnectorSearch);

        const renderings = renderingSearch.getResults().map(result => result.node);
        const propertyConnectors = propertyConnectorSearch.getResults().map(result => result.node);
        const eventConnectors = eventConnectorSearch.getResults().map(result => result.node);

        let rendering = null;
        if (renderings.length > 0 && renderings[0].props && renderings[0].props.content && (!Array.isArray(renderings[0].props.content) || renderings[0].props.content.length > 0)) {
            rendering = Array.isArray(renderings[0].props.content) ? renderings[0].props.content[0] : renderings[0].props.content;
        }

        if (rendering && partNode.props && partNode.props.name) {
            const streamHooks = {};
            const signals = {};

            // Create the stream hooks and connect them to the appropriate stream outputs as defined in the PropertyConnector definitions.
            propertyConnectors.forEach(propConnector => {
                if (propConnector.props.property && propConnector.props.stream && propConnector.props.stream in streams) {
                    const stream = streams[propConnector.props.stream];
                    if (propConnector.props.output && propConnector.props.output in stream.outputs) {
                        const [useOutputStreamHook, outputStream] = bind(stream.outputs[propConnector.props.output], propConnector.props.initial ?? null);
                        streamHooks[propConnector.props.property] = useOutputStreamHook;
                    }
                }
            });
                    
            // Create the event signals and connect them to the appropriate stream inputs as defined in the EventConnector definitions.
            eventConnectors.forEach(eventConnector => {
                if (eventConnector.props.event && eventConnector.props.stream && eventConnector.props.stream in streams) {
                    const stream = streams[eventConnector.props.stream];
                    if (eventConnector.props.input && eventConnector.props.input in stream.inputs) {
                        const streamInput = stream.inputs[eventConnector.props.input];
                        const [eventStream, eventSignal] = createSignal(eventConnector.props.mapper ?? ((...eventArgs) => eventArgs));
                        eventStream.subscribe(streamInput);
                        signals[eventConnector.props.event] = eventSignal;
                    }
                }
            });

            return <FrontendComponentRender key={partNode.props.name} component={rendering} streamHooks={streamHooks} signals={signals} />;
        }
        else {
            return null;
        }
    });

    // Render the stream components.
    const renderedStreamComponents = [];
    for (const streamName in streams) {
        const stream = streams[streamName];
        stream.componentRenderProps.forEach(props =>
            renderedStreamComponents.push(<FrontendComponentRender key={renderedStreamComponents.length} {...props} />)
        );
    }

    return <>{[...renderedParts, ...renderedStreamComponents]}</>
}

const FrontendComponentRender = ({component, streamHooks, signals}) => {
    const newProps = {};
    for (const propertyName in streamHooks) {
        const useStreamHook = streamHooks[propertyName];
        newProps[propertyName] = useStreamHook();
    }
    for (const eventName in signals) {
        const postEventSignal = signals[eventName]
        newProps[eventName] = (...eventArgs) => postEventSignal(...eventArgs);
    }
    return React.cloneElement(component, newProps);
}

FrontendModule.Streams = ({children, ...streamsProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='streams' props={streamsProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendModule.Parts = ({children, ...partsProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='parts' props={partsProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

export default FrontendModule;