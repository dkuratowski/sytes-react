import React from 'react';
import { ComponentTree } from '@sytes/componenttree';

const FrontendStream = ({children, ...streamProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='stream' props={streamProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Capacitor = ({children, ...capacitorProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='capacitor' props={capacitorProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Entry = ({children, ...entryProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='entry' props={entryProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Exit = ({children, ...exitProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='exit' props={exitProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Filter = ({children, ...filterProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='filter' props={filterProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Interval = ({children, ...intervalProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='interval' props={intervalProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Map = ({children, ...mapProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='map' props={mapProps} />
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Merge = ({children, ...mergeProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='merge' props={mergeProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Pipe = ({children, ...pipeProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='pipe' props={pipeProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Scan = ({children, ...scanProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='scan' props={scanProps} />
                {children}
            <ComponentTree.EndNode />
        </>
    );
}

FrontendStream.Tap = ({children, ...tapProps}) => {
    return (
        <>
            <ComponentTree.BeginNode type='tap' props={tapProps} />
            <ComponentTree.EndNode />
        </>
    );
}

export default FrontendStream;