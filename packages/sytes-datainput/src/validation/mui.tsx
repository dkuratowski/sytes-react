import React from "react";
import { FieldValidationInfo } from "../types";

type MuiValidationHelperTextProps = {
    info?: string,
    error?: string,
};

export function MuiValidationHelperText({info, error}: MuiValidationHelperTextProps) {
    if (info && error) {
        return (
            <>
                <span className='wpwedding-forms-info'>{info}</span><br/>
                <span className='wpwedding-forms-error'>{error}</span>
            </>
        );
    }
    else if (!info && error) {
        return <span className='wpwedding-forms-error'>{error}</span>;
    }
    else if (info && !error) {
        return <span className='wpwedding-forms-info'>{info}</span>;
    }
    else {
        return null;
    }
}

export function convertValidationMui(validationInfo: FieldValidationInfo): object {
    return {
        required: !!validationInfo.required,
        error: 'error' in validationInfo,
        helperText: <MuiValidationHelperText info={validationInfo.info} error={validationInfo.error} />
    };
}
