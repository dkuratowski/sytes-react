import { ChangeEvent } from "react";

export function reactEvent<TTargetElement extends HTMLElement>(
    nativeEvent: Event,
    reactEventType: string
): ChangeEvent<TTargetElement> {
    return {
        bubbles: nativeEvent.bubbles,
        cancelable: nativeEvent.cancelable,
        currentTarget: nativeEvent.target as TTargetElement,
        defaultPrevented: nativeEvent.defaultPrevented,
        eventPhase: nativeEvent.eventPhase,
        isDefaultPrevented: () => nativeEvent.defaultPrevented,
        isPropagationStopped: () => false,
        isTrusted: nativeEvent.isTrusted,
        nativeEvent: nativeEvent,
        persist: () => { },
        preventDefault: nativeEvent.preventDefault,
        stopPropagation: nativeEvent.stopPropagation,
        target: nativeEvent.target as TTargetElement,
        timeStamp: nativeEvent.timeStamp,
        type: reactEventType
    };
}
