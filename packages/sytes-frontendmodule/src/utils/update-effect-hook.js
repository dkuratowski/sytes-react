import { useEffect, useRef } from "react";

export function useUpdateEffect(effectCallback, dependencies) {
    const isMountedRef = useRef(false);
    useEffect(() => {
        if (isMountedRef.current) {
            // If this is not the first render, just run the effect callback.
            return effectCallback();
        } else {
            // Do nothing if this is the first render.
            isMountedRef.current = true;
        }
    }, dependencies);
}