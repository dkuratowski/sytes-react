import React, { useRef } from "react";
import {
    TemplatedComponentCtx,
    TemplatedComponentContext,
    useTemplatedComponentContext,
    useTemplateContext,
    TemplateCtx,
    useRepeatContext,
    RepeatCtx,
    ChooseCtx,
    useChooseContext
} from "../utils/templated-component";

// Elements for defining a templated component.
export const TemplatedComponent = ({template: Template, templateProps, children}) => {
    // Use the given template if exists, otherwise get it from the parent TemplateCtx.
    if (!Template) {
        [Template, templateProps] = useTemplateContext();
    }
    else if (!templateProps) {
        templateProps = {};
    }

    if (Template) {
        const templateContext = {
            template: Template,
            templateProps: templateProps
        };
        return (
            <TemplateCtx.Provider value={templateContext}>
                <TemplatedComponentCtx.Provider value={new TemplatedComponentContext()}>
                    {children} {/* ContentItems and ContentPlaceholders */}
                    <Template {...templateProps} />
                </TemplatedComponentCtx.Provider>
            </TemplateCtx.Provider>
        );
    }
    else {
        throw new Error('Template not found for TemlatedComponent!');
    }
}

export const ContentItem = ({children, ...contentItemProps}) => {
    const templatedComponentContext = useTemplatedComponentContext();
    const contentItemDataRef = useRef({});
    contentItemDataRef.current.props = contentItemProps;
    contentItemDataRef.current.children = children;
    contentItemDataRef.current.isRendered = false;
    templatedComponentContext.saveContentItemData(contentItemDataRef.current);
    return null;
}

export const ContentPlaceholder = (contentPlaceholderProps) => {
    const templatedComponentContext = useTemplatedComponentContext();
    const contentPlaceholderDataRef = useRef({});
    contentPlaceholderDataRef.current.props = contentPlaceholderProps;
    contentPlaceholderDataRef.current.isRendered = false;
    templatedComponentContext.saveContentPlaceholderData(contentPlaceholderDataRef.current);
    return null;
}

function ImplicitTemplate({children}) {
    return <>{children}</>;
}

// Elements for defining the template of a templated component.
export const RenderContentItem = ({selector, children}) => {
    const templatedComponentContext = useTemplatedComponentContext();
    const chooseContext = useChooseContext(true);
    let selectedContentItemData = null;
    if (chooseContext && chooseContext.chooseMode) {
        const firstContentItemData = templatedComponentContext.contentItems.find(item => !item.isRendered);
        selectedContentItemData = (firstContentItemData && (!selector || selector(firstContentItemData.props))) ? firstContentItemData : null;
        chooseContext.chooseMode = false;
    }
    else {
        selectedContentItemData = templatedComponentContext.contentItems.find(item => !item.isRendered && (!selector || selector(item.props)));
    }
    if (selectedContentItemData) {
        // if (selectedContentItemData.props.name === 'package') {
        //     console.log('RenderContentItem(name = ' + selectedContentItemData.props.name + ', selected = ' + selectedContentItemData.props.selected + ', disabled = ' + selectedContentItemData.props.disabled + ')');
        // }
        // else if (selectedContentItemData.props.name === 'packages') {
        //     console.log('RenderContentItem(name = ' + selectedContentItemData.props.name + ')');
        // }

        selectedContentItemData.isRendered = true;
        const templateContext = {
            template: ImplicitTemplate,
            templateProps: {
                children: React.Children.map(children, child => React.cloneElement(child, {...child.props}))
            }
        };
        return (
            <TemplateCtx.Provider value={templateContext}>
                <TemplatedComponent>
                    {selectedContentItemData.children}
                </TemplatedComponent>
            </TemplateCtx.Provider>
        );
    }
    else {
        return null;
    }
}

export const RenderContentPlaceholder = ({selector, children}) => {
    const templatedComponentContext = useTemplatedComponentContext();
    const chooseContext = useChooseContext(true);
    let selectedContentPlaceholder = null;
    if (chooseContext && chooseContext.chooseMode) {
        const firstContentPlaceholder = templatedComponentContext.contentPlaceholders.find(placeholder => !placeholder.isRendered);
        selectedContentPlaceholder = (firstContentPlaceholder && (!selector || selector(firstContentPlaceholder.props))) ? firstContentPlaceholder : null;
        chooseContext.chooseMode = false;
    }
    else {
        selectedContentPlaceholder = templatedComponentContext.contentPlaceholders.find(placeholder => !placeholder.isRendered && (!selector || selector(placeholder.props)));
    }
    if (selectedContentPlaceholder) {
        selectedContentPlaceholder.isRendered = true;
        return (
            <>
                {React.Children.map(children, child => React.cloneElement(child, {...selectedContentPlaceholder.props, ...child.props}))}
            </>
        );
    }
    else {
        return null;
    }
}

export const Repeat = ({children}) => {
    // console.log('Repeat');
    const childrenCopy = React.Children.map(children, child => React.cloneElement(child, {...child.props}));

    return (
        <RepeatCtx.Provider value={{}}>
            <RepeatImpl.InitRenderCounters />
            {childrenCopy}
            <RepeatImpl.ContinueIfCountersChanged>{childrenCopy}</RepeatImpl.ContinueIfCountersChanged>
        </RepeatCtx.Provider>
    )
}

const RepeatImpl = {
    InitRenderCounters: () => {
        const repeatContext = useRepeatContext();
        const templatedComponentContext = useTemplatedComponentContext();
        const renderedContentItems = templatedComponentContext.contentItems.filter(item => item.isRendered);
        const renderedContentPlaceholders = templatedComponentContext.contentPlaceholders.filter(placeholder => placeholder.isRendered);
        repeatContext.renderedContentItemsCount = renderedContentItems.length;
        repeatContext.renderedContentPlaceholdersCount = renderedContentPlaceholders.length;
        return null;
    },

    ContinueIfCountersChanged: ({children}) => {
        const repeatContext = useRepeatContext();
        const templatedComponentContext = useTemplatedComponentContext();
        const renderedContentItems = templatedComponentContext.contentItems.filter(item => item.isRendered);
        const renderedContentPlaceholders = templatedComponentContext.contentPlaceholders.filter(placeholder => placeholder.isRendered);
    
        if (repeatContext.renderedContentItemsCount < renderedContentItems.length ||
            repeatContext.renderedContentPlaceholdersCount < renderedContentPlaceholders.length) {
    
            repeatContext.renderedContentItemsCount = renderedContentItems.length;
            repeatContext.renderedContentPlaceholdersCount = renderedContentPlaceholders.length;
            const childrenCopy = React.Children.map(children, child => React.cloneElement(child, {...child.props}));
            return (
                <>
                    {childrenCopy}
                    <RepeatImpl.ContinueIfCountersChanged>{childrenCopy}</RepeatImpl.ContinueIfCountersChanged>
                </>
            );
        }
        else {
            return null;
        }
    }
}

export const Choose = ({children}) => {
    // console.log('Choose');
    const childrenCopy = React.Children.map(children, child => React.cloneElement(child, {...child.props}));
    const firstChild = childrenCopy.length > 0 ? childrenCopy[0] : null;
    const remainingChildren = childrenCopy.slice(1);

    if (firstChild) {
        return (
            <ChooseCtx.Provider value={{}}>
                <ChooseImpl.InitRenderCounters />
                <ChooseImpl.TurnOnChooseMode />
                {firstChild}
                <ChooseImpl.TurnOffChooseMode />
                <ChooseImpl.ContinueIfCountersNotChanged>{remainingChildren}</ChooseImpl.ContinueIfCountersNotChanged>
            </ChooseCtx.Provider>
        );
    }
    else {
        return null;
    }
}

const ChooseImpl = {
    InitRenderCounters: () => {
        const chooseContext = useChooseContext();
        const templatedComponentContext = useTemplatedComponentContext();
        const renderedContentItems = templatedComponentContext.contentItems.filter(item => item.isRendered);
        const renderedContentPlaceholders = templatedComponentContext.contentPlaceholders.filter(placeholder => placeholder.isRendered);
        chooseContext.renderedContentItemsCount = renderedContentItems.length;
        chooseContext.renderedContentPlaceholdersCount = renderedContentPlaceholders.length;
        return null;
    },

    TurnOnChooseMode: () => {
        const chooseContext = useChooseContext();
        chooseContext.chooseMode = true;
        return null;
    },

    TurnOffChooseMode: () => {
        const chooseContext = useChooseContext();
        chooseContext.chooseMode = false;
        return null;
    },

    ContinueIfCountersNotChanged: ({children}) => {
        const chooseContext = useChooseContext();
        const templatedComponentContext = useTemplatedComponentContext();
        const renderedContentItems = templatedComponentContext.contentItems.filter(item => item.isRendered);
        const renderedContentPlaceholders = templatedComponentContext.contentPlaceholders.filter(placeholder => placeholder.isRendered);
    
        if (chooseContext.renderedContentItemsCount === renderedContentItems.length &&
            chooseContext.renderedContentPlaceholdersCount === renderedContentPlaceholders.length) {
    
            const firstChild = children.length > 0 ? children[0] : null;
            const remainingChildren = children.slice(1);
            if (firstChild) {
                return (
                    <>
                        <ChooseImpl.TurnOnChooseMode />
                        {firstChild}
                        <ChooseImpl.TurnOffChooseMode />
                        <ChooseImpl.ContinueIfCountersNotChanged>{remainingChildren}</ChooseImpl.ContinueIfCountersNotChanged>
                    </>
                );
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
}