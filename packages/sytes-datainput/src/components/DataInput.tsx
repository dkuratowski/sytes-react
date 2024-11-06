import React, { createContext, PropsWithChildren, useContext } from 'react';
import { DataChangeEvent, DataInputConfig, DataInputFieldConfig } from '../types';

class DataContext {
    private data: object;
    private onChange: DataChangeEvent;
    private config: DataInputConfig;

    public constructor(data: object, onChange: DataChangeEvent, config: DataInputConfig) {
        this.data = data;
        this.onChange = onChange;
        this.config = config;
    }

    public getFieldConfig<TField, TTargetProp>(fieldName: string): DataInputFieldConfig<TField, TTargetProp> {
        if (!(fieldName in this.config)) {
            throw new Error(`Configuration doesn't exist for data input field '${fieldName}'`);
        }
        return this.config[fieldName];
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
    data: object,
    onChange: DataChangeEvent,
    config: DataInputConfig,
};
const DataInput = ({data, onChange, config, children}: PropsWithChildren<DataInputProps>) => {
    const ctx = new DataContext(data, onChange, config);

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
                if (fieldConfig.isToBeUndefined(newPropertyValue)) {
                    ctx.unsetField(name);
                }
                else {
                    ctx.setField(name, fieldConfig.convertBack(newPropertyValue));
                }
            }
        };
        return React.cloneElement(child as React.ReactElement<any>, newProps);
    });

    return (
        <>{modifiedChildren}</>
    );
}

export default DataInput;
