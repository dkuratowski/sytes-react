export type Method = 'post' | 'get' | 'put' | 'delete';

export type ResourceFieldValidationPolicy = {
    policy: string,
}

export type ResourceTypeMetadata = {
    validation?: { [fieldName: string]: ResourceFieldValidationPolicy[] },
}

export type Metadata = {
    methods?: Method[],
    resourceTypes?: { [resourceType: string]: ResourceTypeMetadata },
}

// TODO: define!
export type Resource = any;

export type ResourceValidationError = {
    error: string,
    details?: { [fieldName: string]: ResourceFieldValidationPolicy[] },
}

// TODO: define!
export type ApiResponse = any;

// TODO: define!
export type ApiRequest = any;

export type Action<
    TParam1 = void,
    TParam2 = void,
    TParam3 = void,
    TParam4 = void
> = (param1: TParam1, param2: TParam2, param3: TParam3, param4: TParam4) => void;

export type Task<TValue> = {
    then: Action<TValue>,
    catch: Action<TValue>,
}

export type ApiClient = {
    get: (url: string) => Task<ApiResponse>,
    post: (url: string, payload: { data: object, method?: 'put'|'delete' }) => Task<ApiResponse>,
    put: (url: string, payload: { data: object }) => Task<ApiResponse>,
    delete: (url: string) => Task<ApiResponse>,
    file: (url: string, file: File) => Task<ApiResponse>,
}
