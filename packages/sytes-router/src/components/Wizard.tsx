import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useWizardConfig, WizardConfig, WizardPage } from "./WizardRouter"

type NavigateProps = {
    page: string | null,
    onTriggered: () => void,
};

function Navigate({ page, onTriggered }: NavigateProps) {
    console.log(`Navigate(page='${page}')`);
    onTriggered();
    return null;
}

export type OpenTriggerHook = () => OpenTriggerHookResult;

export type OpenTriggerHookResult = {
    openTrigger: OpenTrigger
};

export type OpenTrigger = {
    connect: (openHandler: () => void) => void,
    disconnect: () => void,
};

export type WizardProps = {
    navigate?: NavigateCommand,
    onNavigate?: (from: string | null, to: string | null) => void
}

export type NavigateCommand = {
    nextPage: string | null,
};

export default function Wizard({ useOpenTrigger, navigate, onNavigate}: WizardProps & { useOpenTrigger: OpenTriggerHook }) {    
    // The name of the current page or null if the wizard is closed
    const [ currentPage, setCurrentPage ] = useState<string | null>(null);
    console.log(`Wizard(currentPage='${currentPage}')`);

    const config: WizardConfig = useWizardConfig();
    const { openTrigger } = useOpenTrigger();
    const routerNavigate = useNavigate();

    function navigateRouter(to: string | null): void {
        if (to !== null) {
            const toPage = config.pages.find((page: WizardPage) => page.name === to);
            if (!toPage) {
                throw Error(`Page '${to}' not defined in WizardConfig`);
            }

            console.log(`routerNavigate('${toPage.path}')`);
            routerNavigate(toPage.path);

        }
        else {
            console.log(`routerNavigate('/')`);
            routerNavigate('/');
        }
    }

    function handleRouterNavigated(from: string | null, to: string | null): void {
        if (onNavigate && from !== to) {
            console.log(`Router navigated from '${from}' to '${to}'`);
            onNavigate(from, to);
            console.log(`setCurrentPage('${to}')`);
            setCurrentPage(to);
        }
    }

    // Handle opening the wizard:
    //      - if wizard is closed -> connect to the open trigger
    //      - if wizard is opened -> disconnect from the open trigger
    if (currentPage === null) {
        openTrigger.connect(() => {
            console.log(`Open '${config.firstPage}'`);
            navigateRouter(config.firstPage);
        });
    }
    else {
        openTrigger.disconnect();
    }

    // Handle navigation by user interaction.
    useEffect(() => {
        if (navigate && currentPage !== navigate.nextPage) {
            console.log(`Navigate to '${navigate.nextPage}'`);
            navigateRouter(navigate.nextPage);
        }
    }, [navigate]);

    const routes = config.pages.map(page => (
        <Route
            path={page.path}
            element={<Navigate page={page.name} onTriggered={() => handleRouterNavigated(currentPage, page.name)} />}
        />
    ))

    return (
        <Routes>
            <Route path='/' element={<Navigate page={null} onTriggered={() => handleRouterNavigated(currentPage, null)} />} />
            {routes}
        </Routes>
    );
}
