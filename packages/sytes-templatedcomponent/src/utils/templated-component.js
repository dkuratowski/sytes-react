import { createContext, useContext } from "react";

// Context component definitions.
export const TemplateCtx = createContext(null);
export const TemplatedComponentCtx = createContext(null);
export const RepeatCtx = createContext(null);
export const ChooseCtx = createContext(null);

// Context usage hooks.
export function useTemplatedComponentContext() {
    const templatedComponentContext = useContext(TemplatedComponentCtx);
    if (!templatedComponentContext) {
        throw new Error('TemplatedComponentContext not found!')
    }
    return templatedComponentContext;
}

export function useTemplateContext() {
    const templateContext = useContext(TemplateCtx);
    if (templateContext) {
        return [templateContext.template, templateContext.templateProps ?? {}];
    }
    else {
        return [null, null];
    }
}

export function useRepeatContext() {
    const repeatContext = useContext(RepeatCtx);
    if (!repeatContext) {
        throw new Error('RepeatContext not found!')
    }
    return repeatContext;
}

export function useChooseContext() {
    const chooseContext = useContext(ChooseCtx);
    if (!chooseContext) {
        throw new Error('ChooseContext not found!')
    }
    return chooseContext;
}

// Context object definitions.
export class TemplatedComponentContext {
    constructor() {
        this.contentItems = [];
        this.contentPlaceholders = [];
    }

    saveContentItemData = (contentItemData) => {
        if (!this.contentItems.find(data => data === contentItemData)) {
            this.contentItems.push(contentItemData);
        }
    }

    saveContentPlaceholderData = (contentPlaceholderData) => {
        if (!this.contentPlaceholders.find(data => data === contentPlaceholderData)) {
            this.contentPlaceholders.push(contentPlaceholderData);
        }
    }
}