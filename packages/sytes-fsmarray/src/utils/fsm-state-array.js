import { useEffect, useRef, useState } from "react";

class StateArrayWrapper {
    constructor() {
        this.stateArray = null;
        this.isStateArrayUpdated = false;
        this.setStateArray = null;
    }

    load = (stateArray, setStateArray) => {
        // Make a copy of the incoming state array.
        this.stateArray = stateArray.map(record => {
            return {
                item: record.item,
                state: [...record.state],
                itemDefinition: record.itemDefinition
            };
        });
        this.isStateArrayUpdated = false;
        this.setStateArray = setStateArray;
    }

    init = (item, itemDefinition) => {
        const foundRecord = this.stateArray.find(element => element.item === item);
        if (foundRecord === undefined) {
            const initialState = itemDefinition.stateMapping(item);
            this.stateArray.push({
                item: item,
                state: initialState,
                itemDefinition: itemDefinition
            });
            this.isStateArrayUpdated = true;
            return initialState;
        } else {
            throw new Error('Initializing an already initialized element in the state array!');
        }
    }

    getState = (item) => {
        const foundRecord = this.stateArray.find(element => element.item === item);
        if (foundRecord !== undefined) {
            return foundRecord.state;
        } else {
            return null;
        }
    }

    getItemDefinition = (item) => {
        const foundRecord = this.stateArray.find(element => element.item === item);
        if (foundRecord !== undefined) {
            return foundRecord.itemDefinition;
        } else {
            return null;
        }
    }

    setState = (item, newState) => {
        const foundElement = this.stateArray.find(element => element.item === item);
        if (foundElement !== undefined) {
            // Overwrite previous state.
            foundElement.state = newState;
            this.isStateArrayUpdated = true;
        } else {
            throw new Error('Setting the state of a not yet initialized element in the state array!');
        }
    }

    saveIfUpdated = () => {
        if (this.isStateArrayUpdated && this.stateArray && this.setStateArray) {
            this.setStateArray(this.stateArray);
        }
    }

    resetIfNeeded = (items) => {
        if (this.stateArray.length !== items.length || this.stateArray.some((record, idx) => record.item !== items[idx])) {
            this.stateArray = [];
            this.isStateArrayUpdated = true;
        }
    }
}

export function useStateArray(dataItems) {
    const stateArrayWrapperRef = useRef(new StateArrayWrapper());
    const [stateArray, setStateArray] = useState([]);
    stateArrayWrapperRef.current.load(stateArray, setStateArray);

    // Reset the state array after the actual render if the dataItems property has changed.
    useEffect(() => {
        stateArrayWrapperRef.current.resetIfNeeded(dataItems);
    }, [dataItems]);

    // Save the state array after each render if updated.
    useEffect(() => {
        stateArrayWrapperRef.current.saveIfUpdated();
    });

    return stateArrayWrapperRef.current;
}