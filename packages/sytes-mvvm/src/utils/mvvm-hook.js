import { useEffect, useRef } from "react";

/**
 * Begins the definition of a custom hook for user interfaces following the MVVM architecture.
 */
export function mvvm() {
    return new MVVM();
}

/**
 * Implements the MVVM custom hook.
 */
class MVVM {
    constructor() {
    }

    /**
     * Defines the events to be used for calling the API.
     * @param {*} apiEvents An object containing the events to be used for calling the API. Naming convention: 'on*'. Example:
     *                      {
     *                          onCreatePerson: ...,
     *                          onUpdatePerson: ...,
     *                          onDeletePerson: ...
     *                      }
     * @param {*} handleApiInterrupt A function that is called when initialization or command execution gets interrupted by API call.
     */
    api = (apiEvents, handleApiInterrupt) => {
        this.apiEvents = apiEvents;
        this.handleApiInterrupt = handleApiInterrupt;
        return this;
    }

    /**
     * Defines the initialization steps to be executed.
     * @param {*} initActions A factory function that creates an array of initialization steps to be executed. Example:
     *                           () => [
     *                               (model, apiData, apiChanges, api) => { initialization step 1/1 },
     *                               (model, apiData, apiChanges, api) => { initialization step 1/2 },
     *                               (model, apiData, apiChanges, api) => { initialization step 1/3 }
     *                           ]
     */
    init = (initActions) => {
        this.initActions = initActions ?? (() => []);
        return this;
    }

    /**
     * Defines the command steps to be executed for each command types.
     * @param {*} commandActions An associative array that maps each command type to a factory function that will get the command as an input
     *                           and creates an array of command steps to be executed. Example:
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
     */
    commands = (commandActions) => {
        this.commandActions = commandActions;
        return this;
    }

    /**
     * Defines the model update function.
     * @param {*} update A function for updating the model based on API data and API changes. The function shall return the updated
     *                   model if it was updated successfully, undefined if some prerequisites are missing from apiData and/or apiChanges,
     *                   or throw an error in case of error during the model update. Example:
     *                   (model, apiData, apiChanges) => {
     *                     model.someProperty = newPropertyValue;
     *                     return model;
     *                   }
     */
    model = (update) => {
        this.updateModel = update;
        return this;
    }

    /**
     * Defines the viewmodel update and view notification function.
     * @param {*} update A function for updating the viewmodel. Example:
     *                   (model) => {
     *                     const familiesViewModel = transformModel(model);
     *                     return familiesViewModel;
     *                   }
     * @param {*} notify A function for notifying the view about the updated viewmodel. It is used by the framework as follows:
     *                   notify(updatedViewModel)
     */
    viewmodel = (update, notify) => {
        this.updateViewModel = update;
        this.onViewModel = notify;
        return this;
    }

    /**
     * Finalizes the definition of the MVVM custom hook and starts using it.
     * @param {*} command A command coming from the view. Example:
     *                    {
     *                      type: 'type-of-the-command',
     *                      params: { parameters of the comand }
     *                    }
     * @param {*} apiData An object containing the aggregated data coming from the API (typically contains 1 or more collection resources).
     *                    Example:
     *                    {
     *                      familiesCollection: { a collection resource containing 'family' resources },
     *                      personsCollection: { a collection resource containing 'person' resources }
     *                    }
     * @param {*} apiChanges An object containing the changes in the aggregated data coming from the API (typically contains the list of
     *                       created, updated and deleted resources).
     *                       Example:
     *                       {
     *                          createdResources: [ an array of newly created resources ],
     *                          updatedResources: [ an array of existing resources that were updated ],
     *                          deletedResources: [ an array of existing resources that were deleted ]
     *                       }
     */
    use = (command, apiData, apiChanges) => {
        this.modelRef = useRef(null);
        this.statusRef = useRef(this.initActions ? 'init-waiting' : 'idle');
        this.pendingActionsRef = useRef(this.initActions ? [...this.initActions()] : []);

        // Handle the arrival of a new command from the view.
        useEffect(() => {
            if (command === null) {
                return;
            }

            if (this.statusRef.current !== 'idle') {
                throw new Error('Invalid status \'' + this.statusRef.current + '\'!');
            }

            if (!(command.type in this.commandActions)) {
                throw new Error('Invalid user command of type \'' + command.type + '\'!');
            }

            // Starting command execution.
            this.statusRef.current = 'command-exec';
            const commandHandler = this.commandActions[command.type];
            this.pendingActionsRef.current.push(...commandHandler(command));
            const requestSent = this._executeActions(apiData, apiChanges);
            if (!requestSent) {
                // Command execution finished.
                this.statusRef.current = 'idle';
                this._updateViewModel();
            }
            else {
                // Command execution interrupted by API call.
                this.handleApiInterrupt && this.handleApiInterrupt();
                this.statusRef.current = 'command-waiting';
                this._updateViewModel();
            }
        }, [command]);

        // Handle the changes update coming from the API.
        useEffect(() => {
            if (apiChanges === null) {
                return;
            }

            // Resuming initialization or command execution.
            if (this.statusRef.current === 'init-waiting') {
                this.statusRef.current = 'init-exec';
            }
            else if (this.statusRef.current === 'command-waiting') {
                this.statusRef.current = 'command-exec';
            }
            else {
                throw new Error('Invalid status \'' + this.statusRef.current + '\'!');
            }

            // Update the model state based on the incoming data from the API.
            try {
                const updatedModelState = this.updateModel(this.modelRef.current, apiData, apiChanges);
                if (updatedModelState !== undefined) {
                    this.modelRef.current = updatedModelState;
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

            // Execute the pending actions until first request sent.
            const requestSent = this._executeActions(apiData, apiChanges);
            if (!requestSent) {
                // Initialization or command execution finished.
                this.statusRef.current = 'idle';
                this._updateViewModel();
            }
            else {
                // Initialization or command execution interrupted by API call.
                if (this.statusRef.current === 'init-exec') {
                    this.handleApiInterrupt && this.handleApiInterrupt();
                    this.statusRef.current = 'init-waiting';
                    this._updateViewModel();
                }
                else if (this.statusRef.current === 'command-exec') {
                    this.handleApiInterrupt && this.handleApiInterrupt();
                    this.statusRef.current = 'command-waiting';
                    this._updateViewModel();
                }
            }
        }, [apiChanges]);
    }

    _executeActions = (apiData, apiChanges) => {
        while (this.pendingActionsRef.current.length > 0) {
            const action = this.pendingActionsRef.current.shift();
            const api = new ApiWrapper(this.apiEvents);
            action(this.modelRef.current, apiData, apiChanges, api);
            if (api.requestSent) {
                return true;
            }
        }
        return false;
    }

    _updateViewModel = () => {
        try {
            const updatedViewModel = this.updateViewModel(this.modelRef.current);
            if (updatedViewModel !== undefined) {
                this.onViewModel(updatedViewModel);
            }
            else {
                console.log('The function \'updateViewModel\' did not return any value!');
                return;
            }
        } catch (error) {
            console.error('Error happened during viewmodel update:');
            console.error(error);
            return;
        }
    }
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
