import { ReactNode } from "react";

export type DataInputFieldConfig<TField, TTargetProp> = {
    // The name of the target property of the control.
    // Default: 'value'
    targetPropertyName: string,

    // A function that converts the value in the corresponding field of the input data to the value to be injected into the target
    // property of the target control.
    // Default: value => value
    convert: (value: TField) => TTargetProp,

    // A function that creates the value to be injected into the target property of the target control when the corresponding field
    // of the input data is undefined or doesn't exist (warning: a field with null value is considered not to be undefined).
    // Default: empty string
    convertUndefined: () => TTargetProp,

    // The name of the event of the target control that is raised when the target property has changed.
    // Default: 'onChange'
    sourceEventName: string

    // A function that extracts the new value of the target property from the source event raised by the target control.
    // Default: event => event.target.value.trim()
    extractFromEvent: (event: any) => TTargetProp,

    // A function to decide whether the given value of the target property of the target control shall be considered to be undefined
    // in the input data (in the sense as in the definition of DataInputFieldConfig.convertUndefined).
    // Default: value => value === ''
    isToBeUndefined: (value: TTargetProp) => boolean,

    // A function that converts back the new value of the target property to the new value of the corresponding field of the input
    // data (if it shall not be considered to be undefined based on the result of the DataInputFieldConfig.isToBeUndefined function).
    // Default: value => value
    convertBack: (value: TTargetProp) => TField,

    // A function that converts the validation info of the corresponding field of the input data to a set of properties of the
    // control.
    convertValidation: (info: FieldValidationInfo) => object,
};

export type DataInputConfig = {
    [key: string]: DataInputFieldConfig<any, any>,
};

export type PartialDataInputConfig = {
    [key: string]: Partial<DataInputFieldConfig<any, any>> | null,
}

export type DataChangeEvent = (newData: object) => void;

export type FieldValidationInfo = {
    info?: string,
    error?: string,
}

export type ValidationInfo = {
    [key: string]: FieldValidationInfo
}
