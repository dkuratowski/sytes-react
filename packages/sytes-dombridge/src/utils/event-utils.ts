import { ChangeEvent, MouseEvent as ReactMouseEvent } from "react";

export function reactChangeEvent<TTargetElement extends HTMLElement>(
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

export function reactMouseEvent<TTargetElement extends HTMLElement>(
    nativeEvent: MouseEvent,
    reactEventType: string
): ReactMouseEvent<TTargetElement> {
    return {
        altKey: nativeEvent.altKey,
        bubbles: nativeEvent.bubbles,
        button: nativeEvent.button,
        buttons: nativeEvent.buttons,
        cancelable: nativeEvent.cancelable,
        clientX: nativeEvent.clientX,
        clientY: nativeEvent.clientY,
        ctrlKey: nativeEvent.ctrlKey,
        currentTarget: nativeEvent.target as TTargetElement,
        defaultPrevented: nativeEvent.defaultPrevented,
        detail: nativeEvent.detail,
        eventPhase: nativeEvent.eventPhase,
        getModifierState: nativeEvent.getModifierState,
        isDefaultPrevented: () => nativeEvent.defaultPrevented,
        isPropagationStopped: () => false,
        isTrusted: nativeEvent.isTrusted,
        metaKey: nativeEvent.metaKey,
        movementX: nativeEvent.movementX,
        movementY: nativeEvent.movementY,
        nativeEvent: nativeEvent,
        pageX: nativeEvent.pageX,
        pageY: nativeEvent.pageY,
        persist: () => { },
        preventDefault: nativeEvent.preventDefault,
        relatedTarget: nativeEvent.relatedTarget,
        screenX: nativeEvent.screenX,
        screenY: nativeEvent.screenY,
        shiftKey: nativeEvent.shiftKey,
        stopPropagation: nativeEvent.stopPropagation,
        target: nativeEvent.target as TTargetElement,
        timeStamp: nativeEvent.timeStamp,
        type: reactEventType,
        view: {
            styleMedia: {
                type: 'window',
                matchMedium: mediaQuery => true
            },
            document: document
        }
    };
}
