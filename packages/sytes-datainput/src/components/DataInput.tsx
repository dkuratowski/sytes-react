import React, { createContext, PropsWithChildren, useContext } from 'react';
import { DataChangeEvent, DataInputConfig, DataInputFieldConfig, FieldValidationInfo, PartialDataInputConfig, ValidationInfo } from '../types';

type MuiValidationHelperTextProps = {
    info?: string,
    error?: string,
};
function MuiValidationHelperText({info, error}: MuiValidationHelperTextProps) {
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

const defaultFieldConfig: DataInputFieldConfig<any, any> = {
    targetPropertyName: 'value',
    convert: value => value,
    convertUndefined: () => '',
    sourceEventName: 'onChange',
    extractFromEvent: event => event.target.value.trim(),
    isToBeUndefined: value => value === '',
    convertBack: value => value,
    convertValidation: (validationInfo: FieldValidationInfo) => ({
        error: 'error' in validationInfo,
        helperText: <MuiValidationHelperText info={validationInfo.info} error={validationInfo.error} />
    }),
};

class DataContext {
    private config: DataInputConfig;
    private data: object;
    private validation: ValidationInfo;
    private onChange?: DataChangeEvent;

    public constructor(config: PartialDataInputConfig, data: object, validation?: ValidationInfo, onChange?: DataChangeEvent) {
        this.config = Object.fromEntries(
            Object.entries(config).map(([fieldName, fieldConfig]) => {
                if (fieldConfig === null) {
                    return [fieldName, defaultFieldConfig]
                }
                else {
                    return [fieldName, {...defaultFieldConfig, ...fieldConfig}]
                }
            })
        );
        this.data = data;
        this.validation = validation ?? {};
        this.onChange = onChange;
    }

    public getFieldConfig<TField, TTargetProp>(fieldName: string): DataInputFieldConfig<TField, TTargetProp> {
        if (!(fieldName in this.config)) {
            throw new Error(`Configuration doesn't exist for data input field '${fieldName}'`);
        }
        return this.config[fieldName];
    }

    public hasFieldValidationInfo(fieldName: string): boolean {
        return fieldName in this.validation && this.validation[fieldName] !== undefined;
    }

    public getFieldValidationInfo(fieldName: string): FieldValidationInfo {
        if (!(fieldName in this.validation) || this.validation[fieldName] === undefined) {
            throw new Error(`Field '${fieldName}' has no validation info`);
        }
        return this.validation[fieldName];
    }

    public isFieldUndefined(fieldName: string): boolean {
        return fieldName in this.data && this.data[fieldName] !== undefined;
    }

    public getField<TField>(fieldName: string): TField {
        if (!(fieldName in this.data) || this.data[fieldName] === undefined) {
            throw new Error(`Field '${fieldName}' is undefined`);
        }
        return this.data[fieldName];
    }

    public setField<TField>(fieldName: string, newValue: TField): void {
        const newData: object = {...this.data};
        newData[fieldName] = newValue;

        const changeDetected = this.data[fieldName] !== newData[fieldName];
        this.data = newData;
        if (changeDetected && this.onChange) { this.onChange(this.data); }
    }

    public unsetField(fieldName: string): void {
        const newData: object = {...this.data};
        let changeDetected: boolean = false;
        if (fieldName in newData) {
            delete newData[fieldName];
            changeDetected = true;
        }
        this.data = newData;
        if (changeDetected && this.onChange) { this.onChange(this.data); }
    }
}

const DataInputContext = createContext<DataContext | null>(null);

const useDataInputContext = () => {
    const dataInputContext = useContext(DataInputContext);
    if (!dataInputContext) { throw new Error('DataInput context not found!'); }
    return dataInputContext;
}

type DataInputProps = {
    config: PartialDataInputConfig,
    data: object,
    validation?: ValidationInfo,
    onChange?: DataChangeEvent,
};
const DataInput = ({config, data, validation, onChange, children}: PropsWithChildren<DataInputProps>) => {
    const ctx = new DataContext(config, data, validation, onChange);

    return (
        <DataInputContext.Provider value={ctx}>
            {children}
        </DataInputContext.Provider>
    );
}

type DataInputFieldProps = {
    name: string,
};
DataInput.Field = ({name, children}: PropsWithChildren<DataInputFieldProps>) => {
    const ctx = useDataInputContext();
    const fieldConfig = ctx.getFieldConfig(name);

    const modifiedChildren = React.Children.map(children, child => {
        const newProps = {
            [fieldConfig.targetPropertyName]: ctx.isFieldUndefined(name) ? fieldConfig.convert(ctx.getField(name)) : fieldConfig.convertUndefined(),
            [fieldConfig.sourceEventName]: event => {
                const newPropertyValue = fieldConfig.extractFromEvent(event);
                if (name === 'selectedDomains') {
                    console.log(newPropertyValue);
                }
                if (fieldConfig.isToBeUndefined(newPropertyValue)) {
                    ctx.unsetField(name);
                }
                else {
                    ctx.setField(name, fieldConfig.convertBack(newPropertyValue));
                }
            }
        };

        const validationProps = ctx.hasFieldValidationInfo(name) ? fieldConfig.convertValidation(ctx.getFieldValidationInfo(name)) : {};

        return React.cloneElement(child as React.ReactElement<any>, { ...newProps, ...validationProps });
    });

    return (
        <>{modifiedChildren}</>
    );
}

export default DataInput;
