import React from 'react';
import { bind } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
import { useUpdateEffect } from './update-effect-hook';
import { buffer, skip } from 'rxjs';

function CapacitorComponent({ input, onBufferNotification }) {
    useUpdateEffect(() => {
        onBufferNotification();
    }, [input]);

    return null;
}

export function createCapacitor() {
    const capacitorComponentRenderProps = {
        component: React.createElement(CapacitorComponent),
        streamHooks: {},
        signals: {}
    };

    const capacitorOperator = capacitorInputObs => {
        const [useCapacitorInput, boundCapacitorInputObs] = bind(capacitorInputObs, null);
        const [bufferNotification, bufferNotificationSignal] = createSignal((...eventArgs) => eventArgs);
        capacitorComponentRenderProps.streamHooks.input = useCapacitorInput;
        capacitorComponentRenderProps.signals.onBufferNotification = bufferNotificationSignal;
        return boundCapacitorInputObs.pipe(skip(1), buffer(bufferNotification));
    };

    return [capacitorOperator, capacitorComponentRenderProps];
}