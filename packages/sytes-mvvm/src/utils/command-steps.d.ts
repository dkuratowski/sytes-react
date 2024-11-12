import { MvvmAction } from "./mvvm-hook";

export type MvvmCheck<TModel, TApiData, TApiChanges> =
    (model: TModel, apiData: TApiData, apiChanges: TApiChanges) => boolean;

export type MvvmCheckResult<TModel, TApiData, TApiChanges, TApiEvents> = {
    then: MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>,
    else:  MvvmAction<TModel, TApiData, TApiChanges, TApiEvents>,
}

export function checkIf<TModel, TApiData, TApiChanges, TApiEvents>(
    condition: MvvmCheck<TModel, TApiData, TApiChanges>
) : MvvmCheckResult<TModel, TApiData, TApiChanges, TApiEvents>
