
declare module '@sytes/mvvm' {
    export type Api<TApiEvents> = {
        [ApiEvent in keyof TApiEvents as (ApiEvent extends `on${infer ApiMethod}` ? Uncapitalize<ApiMethod> : ApiEvent)]: TApiEvents[ApiEvent]
    };

    export type MvvmAction<TModel, TApiData, TApiChanges, TApiEvents> =
        (model: TModel, apiData: TApiData, apiChanges: TApiChanges, api: Api<TApiEvents>) => void;

    export type MvvmCommandActions<TModel, TApiData, TApiChanges, TApiEvents> = {
        [key: string]: (command: MvvmCommand) => MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>[]
    };

    export type UpdateModelFunction<TModel, TApiData, TApiChanges> =
        (model: TModel, apiData: TApiData, apiChanges: TApiChanges) => TModel | null | undefined;

    export type UpdateViewModelFunction<TModel, TViewModel> =
        (model: TModel) => TViewModel;

    export type NotifyViewAction<TViewModel> =
        (viewmodel: TViewModel) => void;

    export type MvvmCommand<TCommandType extends string> = {
        type: TCommandType,
        params?: {[key: string]: any}
    }

    export type MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents> = {
        api: (apiEvents: TApiEvents, handleApiInterrupt?: () => void) => MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>,
        init: (initActions?: () => MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>[]) => MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>,
        commands: (commandActions: MvvmCommandActions<TModel, TApiData, TApiChanges, TApiEvents>) => MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>,
        model: (update: UpdateModelFunction<TModel, TApiData, TApiChanges>, initialState?: TModel) => MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>,
        viewmodel: (update: UpdateViewModelFunction<TModel, TViewModel>, notify: NotifyViewAction<TViewModel>) => MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>,
        use: (command?: MvvmCommand, apiData?: TApiData, apiChanges?: TApiChanges) => void
    };

    export function mvvm<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>(): MvvmBuilder<TModel, TViewModel, TApiData, TApiChanges, TApiEvents>;

    export type MvvmCheck<TModel, TApiData, TApiChanges> =
        (model: TModel, apiData: TApiData, apiChanges: TApiChanges) => boolean;

    export type MvvmCheckResult<TModel, TApiData, TApiChanges, TApiEvents> = {
        then: (action: MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>) => MvvmCheckResult<TModel, TApiData, TApiChanges, TApiEvents> & MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>,
        else:  (action: MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>) => MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>,
    }

    export function checkIf<TModel, TApiData, TApiChanges, TApiEvents>(
        condition: MvvmCheck<TModel, TApiData, TApiChanges>
    ) : MvvmCheckResult<TModel, TApiData, TApiChanges, TApiEvents>
}
