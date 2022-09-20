import React, { createContext, useContext } from 'react';

class DataContext {
    constructor(data, onChange) {
        this.data = data;
        this.onChange = onChange;
    }

    setData = (fieldName, newValue) => {
        const newData = {...this.data};
        if (fieldName in newData && (newValue === null || newValue === undefined)) {
            delete newData[fieldName];
        }
        else {
            newData[fieldName] = newValue;
        }

        const changeDetected = this.data[fieldName] !== newData[fieldName];
        this.data = newData;
        if (changeDetected && this.onChange) { this.onChange(this.data); }
    }
}

const DataInputContext = createContext(null);

const useDataInputContext = () => {
    const dataInputContext = useContext(DataInputContext);
    if (!dataInputContext) { throw new Error('DataInput context not found!'); }
    return dataInputContext;
}

const DataInput = ({data, onChange, children}) => {
    const ctx = new DataContext(data, onChange);
    ctx.onChange = onChange;

    return (
        <DataInputContext.Provider value={ctx}>
            {children}
        </DataInputContext.Provider>
    );
}

DataInput.Field = ({name, targetProp, emptyValue, sourceEvent, sourceEventConverter, trimSource, children}) => {
    if (!targetProp) { targetProp = 'value'; }
    if (emptyValue === undefined) { emptyValue = ''; }
    if (!sourceEvent) { sourceEvent = 'onChange'; }
    if (!sourceEventConverter) { sourceEventConverter = event => event.target.value; }
    if (trimSource === undefined) { trimSource = true; }

    const ctx = useDataInputContext();
    const modifiedChildren = React.Children.map(children, child => {
        const newProps = {
            [targetProp]: name in ctx.data ? ctx.data[name] : emptyValue,
            [sourceEvent]: event => {
                let newValue = sourceEventConverter(event);
                if (trimSource && (typeof newValue === 'string')) { newValue = newValue.trim(); }
                if (newValue !== emptyValue) {
                    ctx.setData(name, newValue);
                }
                else {
                    ctx.setData(name);
                }
            }
        };
        return React.cloneElement(child, newProps);
    });

    return (
        <>{modifiedChildren}</>
    );
}

export default DataInput;