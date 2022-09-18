import { useContext, useEffect, useRef } from "react";
import { FSMArrayClusterCtx, FSMArrayLocalCtx } from "../components/FSMArrayCluster";

// Retrieves the cluster level transition subject or null if it doesn't exist.
function useClusterTransitionSubject() {
    return useContext(FSMArrayClusterCtx);
}

// Retrieves the local transition subject.
function useLocalTransitionSubject() {
    return useContext(FSMArrayLocalCtx);
}

// Retrieves the cluster level transition subject if exists, or the local one otherwise.
export function useTransitionSubject() {
    const transitionHandlerRef = useRef(null);
    const clusterTransitionSubject = useClusterTransitionSubject();
    const localTransitionSubject = useLocalTransitionSubject();
    const transitionSubject = clusterTransitionSubject ? clusterTransitionSubject : localTransitionSubject;

    useEffect(() => {
        const subscription = transitionSubject.subscribe({
            next: (transitionEvent) => transitionHandlerRef.current && transitionHandlerRef.current(transitionEvent)
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // The consumer can set the transition handler using this setter.
    const setTransitionHandler = (transitionHandler) => transitionHandlerRef.current = transitionHandler;
    return [transitionSubject, setTransitionHandler];
}