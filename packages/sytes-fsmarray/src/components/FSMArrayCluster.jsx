import React, { createContext, useRef } from 'react';
import { Subject } from 'rxjs';

export const FSMArrayClusterCtx = createContext(null);
export const FSMArrayLocalCtx = createContext(null);

// This component provides a common transition subject for a cluster of FSMArrays.
export const FSMArrayCluster = ({children}) => {
    const clusterTransitionSubject = useRef(new Subject());
    return (
        <FSMArrayClusterCtx.Provider value={clusterTransitionSubject.current}>
            {children}
        </FSMArrayClusterCtx.Provider>
    );
}

// This component provides a local transition subject for a single FSMArray instance that is not placed inside a cluster.
export const FSMArrayLocal = ({children}) => {
    const localTransitionSubject = useRef(new Subject());
    return (
        <FSMArrayLocalCtx.Provider value={localTransitionSubject.current}>
            {children}
        </FSMArrayLocalCtx.Provider>
    );
}

// Can be used to exclude underlying FSMArrays from the actual cluster.
export const FSMArrayClusterExclude = ({children}) => {
    return (
        <FSMArrayClusterCtx.Provider value={null}>
            {children}
        </FSMArrayClusterCtx.Provider>
    );
}