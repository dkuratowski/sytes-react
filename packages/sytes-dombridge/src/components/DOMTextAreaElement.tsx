import { ChangeEventHandler, useEffect } from 'react';
import { reactChangeEvent } from '../utils/event-utils';

type Props = {
    textAreaElement: HTMLInputElement,
    value?: string
    disabled?: boolean,
    onChange?: ChangeEventHandler<HTMLTextAreaElement>
}

function DOMTextAreaElement({ textAreaElement, value, disabled, onChange }: Props) {
    useEffect(() => {
        textAreaElement.value = value ?? '';
        if (disabled) {
            textAreaElement.setAttribute('disabled', '');
        }
        else {
            textAreaElement.removeAttribute('disabled');
        }

        const listener = onChange ? (e: Event) => onChange(reactChangeEvent<HTMLTextAreaElement>(e, 'change')) : (e: Event) => { };
        textAreaElement.addEventListener('input', listener);
        return () => {
            textAreaElement.removeEventListener('input', listener);
        }
    }, [textAreaElement, value, disabled, onChange]);
}

export default DOMTextAreaElement;
