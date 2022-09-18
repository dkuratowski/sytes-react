import { useEffect, useRef } from "react";

/**
 * Custom hook for user interfaces following the MVVM architecture.
 * 
 * @param {*} command A command coming from the view. Example:
 *                    {
 *                      type: 'type-of-the-command',
 *                      params: { parameters of the comand }
 *                    }
 * 
 * @param {*} apiData An object containing the aggregated data coming from the API (typically contains 1 or more collection resources).
 *                    Example:
 *                    {
 *                      familiesCollection: { a collection resource containing 'family' resources },
 *                      personsCollection: { a collection resource containing 'person' resources }
 *                    }
 * 
 * @param {*} apiChanges An object containing the changes in the aggregated data coming from the API (typically contains the list of
 *                       created, updated and deleted resources).
 *                       Example:
 *                       {
 *                          createdResources: [ an array of newly created resources ],
 *                          updatedResources: [ an array of existing resources that were updated ],
 *                          deletedResources: [ an array of existing resources that were deleted ]
 *                       }
 * 
 * @param {*} commandHandlers An associative array that maps each command type to a factory function that will get the command as an input
 *                            and creates an array of command steps to be executed. Example:
 *                            {
 *                              'command-type-1': (command) => [
 *                                 (model, apiData, apiChanges, api) => { command step 1/1 },
 *                                 (model, apiData, apiChanges, api) => { command step 1/2 },
 *                                 (model, apiData, apiChanges, api) => { command step 1/3 }
 *                              ],
 *                              'command-type-2': (command) => [
 *                                 (model, apiData, apiChanges, api) => { command step 2/1 },
 *                                 (model, apiData, apiChanges, api) => { command step 2/2 },
 *                                 (model, apiData, apiChanges, api) => { command step 2/3 }
 *                              ],
 *                            }
 * 
 * @param {*} apiEvents An object containing the events to be used for calling the API. Naming convention: 'on*'. Example:
 *                      {
 *                          onCreatePerson: ...,
 *                          onUpdatePerson: ...,
 *                          onDeletePerson: ...
 *                      }
 * 
 * @param {*} updateModel A function for updating the model based on API data and API changes. The function shall return the updated
 *                        model if it was updated successfully, undefined if some prerequisites are missing from apiData and/or apiChanges,
 *                        or throw an error in case of error during the model update.
 *                        Example:
 *                        (model, apiData, apiChanges) => {
 *                          model.someProperty = newPropertyValue;
 *                          return model;
 *                        }
 * 
 * @param {*} updateViewModel A function for updating the viewmodel and send it to the view. Example:
 *                            (model) => {
 *                              const familiesViewModel = transformModel(model);
 *                              onFamiliesViewModel(familiesViewModel);
 *                            }
 * 
 */
export function useMVVM(command, apiData, apiChanges, commandHandlers, apiEvents, updateModel, updateViewModel) {
    const modelRef = useRef(null);
    const pendingCommandStepsRef = useRef([]);

    // Handle the arrival of a new command from the view.
    useEffect(() => {
        if (command === null) {
            return;
        }

        if (!(command.type in commandHandlers)) {
            throw new Error('Invalid user command of type \'' + command.type + '\'!');
        }

        if (pendingCommandStepsRef.current.length > 0) {
            throw new Error('Command execution in progress!');
        }
        
        const commandHandler = commandHandlers[command.type];
        pendingCommandStepsRef.current.push(...commandHandler(command));
        executeCommandStepsUntilFirstRequestSent(pendingCommandStepsRef.current, modelRef.current, apiData, apiChanges, apiEvents);
    }, [command]);

    // Handle the changes update coming from the API.
    useEffect(() => {
        try {
            const newModelState = updateModel(modelRef.current, apiData, apiChanges);
            if (newModelState !== undefined) {
                modelRef.current = newModelState;
            }
            else {
                console.log('The function \'updateModel\' did not return any value!');
                return;
            }
        } catch (error) {
            console.error('Error happened during model update:');
            console.error(error);
            return;
        }

        const requestSent = executeCommandStepsUntilFirstRequestSent(pendingCommandStepsRef.current, modelRef.current, apiData, apiChanges, apiEvents);
        if (!requestSent) {
            updateViewModel(modelRef.current);
        }
    }, [apiChanges]);
}


// Internals.
function executeCommandStepsUntilFirstRequestSent(pendingCommandSteps, model, apiData, apiChanges, apiEvents) {
    while (pendingCommandSteps.length > 0) {
        const commandStep = pendingCommandSteps.shift();
        const api = new ApiWrapper(apiEvents);
        commandStep(model, apiData, apiChanges, api);
        if (api.requestSent) {
            return true;
        }
    }
    return false;
}

class ApiWrapper {
    constructor(apiEvents) {
        for (const eventName in apiEvents) {
            if (!eventName.startsWith('on')) {
                throw new Error('Event names in \'apiEvents\' shall be of the form \'on*\' (e.g.: \'onCreatePerson\'). The following event name doesn\'t match this criteria: ' + eventName);
            }

            const methodName = eventName.slice(2).charAt(0).toLowerCase() + eventName.slice(3);
            this[methodName] = (...args) => {
                this.apiEvents[eventName](...args);
                this.requestSent = true;
            };
        }

        this.apiEvents = { ...apiEvents };
        this.requestSent = false;
    }
}