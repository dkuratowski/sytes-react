/**
 * Returns a conditional command step.
 * Example usage:
 *      checkIf((model, apiData, apiChanges) => { condition check })
 *          .then((model, apiData, apiChanges, api) => { execute if condition check returned true })
 *          .else((model, apiData, apiChanges, api) => { execute if condition check returned false })
 */
 export function checkIf(conditionFunction) {
    const functionRegistry = {
        conditionFunction: conditionFunction,
        thenFunction: null,
        elseFunction: null
    };

    const conditionalCommandStep = (function(model, apiData, apiChanges, api) {
        if (!this.thenFunction) {
            throw new Error('Conditional command step error: \'then\' is missing!');
        }
        if (this.conditionFunction(model, apiData, apiChanges)) {
            this.thenFunction(model, apiData, apiChanges, api);
        } else if (this.elseFunction) {
            this.elseFunction(model, apiData, apiChanges, api);
        }
    }).bind(functionRegistry);

    conditionalCommandStep.then = (function(thenFunction) {
        if (this.thenFunction) {
            throw new Error('Conditional command step error: \'then\' used multiple times!');
        }
        this.thenFunction = thenFunction;
        return conditionalCommandStep;
    }).bind(functionRegistry);

    conditionalCommandStep.else = (function(elseFunction) {
        if (!this.thenFunction) {
            throw new Error('Conditional command step error: \'else\' used before \'then\'!')
        }
        if (this.elseFunction) {
            throw new Error('Conditional command step error: \'else\' used multiple times!');
        }
        this.elseFunction = elseFunction;
        return conditionalCommandStep;
    }).bind(functionRegistry);

    return conditionalCommandStep;
}
