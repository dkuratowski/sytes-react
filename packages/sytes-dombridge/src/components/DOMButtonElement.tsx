import { MouseEventHandler, useEffect } from 'react';
import { reactMouseEvent } from '../utils/event-utils';

type Props = {
    buttonElement: HTMLButtonElement,
    disabled?: boolean,
    onClick?: MouseEventHandler<HTMLButtonElement>
}

function DOMInputElement({ buttonElement, disabled, onClick }: Props) {
    useEffect(() => {
        if (disabled) {
            buttonElement.setAttribute('disabled', '');
        }
        else {
            buttonElement.removeAttribute('disabled');
        }

        const listener = onClick ? (e: MouseEvent) => onClick(reactMouseEvent<HTMLButtonElement>(e, 'click')) : (e: MouseEvent) => { };
        buttonElement.addEventListener('click', listener);
        return () => {
            buttonElement.removeEventListener('click', listener);
        }
    }, [buttonElement, disabled, onClick]);
}

export default DOMInputElement;
