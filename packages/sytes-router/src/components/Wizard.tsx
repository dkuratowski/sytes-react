import React from "react";
import { Route, Routes } from "react-router-dom";
import { useWizardConfig, WizardConfig } from "./WizardRouter"

type NavigateProps = {
    onTriggered: () => void,
};

function Navigate({ onTriggered }: NavigateProps) {
    onTriggered();
    return null;
}

type WizardProps = {
    completedPages?: string[],
    currentPage?: string,
    onNavigate?: (from: string | null, to: string | null) => void
}

export default function Wizard({ completedPages, currentPage, onNavigate}: WizardProps) {
    const config: WizardConfig = useWizardConfig();

    function handleNavigate(from: string | null, to: string | null): void {
        console.log(`Navigating from '${from}' to '${to}')`);
        // TODO: implement navigation handling!
    }

    const routes = config.pages.map(page => (
        <Route
            path={page.path}
            element={
                <Navigate onTriggered={() => handleNavigate(currentPage ?? null, page.name)} />
            }
        />
    ))

    return (
        <Routes>
            <Route path='/' element={<Navigate onTriggered={() => handleNavigate(currentPage ?? null, null)} />} />
            {routes}
        </Routes>
    );
}
