import { ChangeEventHandler, useEffect } from 'react';
import { reactChangeEvent } from '../utils/event-utils';

type Props = {
    inputElement: HTMLInputElement,
    value?: string
    checked?: boolean,
    disabled?: boolean,
    onChange?: ChangeEventHandler<HTMLInputElement>
}

function DOMInputElement({ inputElement, value, checked, disabled, onChange }: Props) {
    useEffect(() => {
        inputElement.setAttribute('value', value ?? '');
        if (checked) {
            inputElement.setAttribute('checked', '');
        }
        else {
            inputElement.removeAttribute('checked');
        }
        if (disabled) {
            inputElement.setAttribute('disabled', '');
        }
        else {
            inputElement.removeAttribute('disabled');
        }

        const listener = onChange ? (e: Event) => onChange(reactChangeEvent<HTMLInputElement>(e, 'change')) : (e: Event) => { };
        inputElement.addEventListener('input', listener);
        return () => {
            inputElement.removeEventListener('input', listener);
        }
    }, [inputElement, value, checked, disabled, onChange]);
}

export default DOMInputElement;
