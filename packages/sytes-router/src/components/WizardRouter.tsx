import React, { createContext, PropsWithChildren, useContext } from 'react';

import { BrowserRouter } from 'react-router-dom';

const WizardConfigCtx = createContext<WizardConfig | null>(null);

export function useWizardConfig(): WizardConfig {
    const wizardConfig = useContext(WizardConfigCtx);
    if (!wizardConfig) {
        throw new Error('WizardConfigCtx not found!');
    }
    return wizardConfig;
}

export type WizardConfig = {
    baseUrl: string,
    pages: WizardPage[],
}

export type WizardPage = {
    name: string,
    path: string,
}

type WizardRouterProps = {
    config: WizardConfig,
}

export default function WizardRouter({ config, children }: PropsWithChildren<WizardRouterProps>) {
    return (
        <WizardConfigCtx.Provider value={config}>
            <BrowserRouter basename={config.baseUrl}>
                {children}
            </BrowserRouter>
        </WizardConfigCtx.Provider>
    );
}
