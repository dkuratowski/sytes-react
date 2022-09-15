import { filter, interval, map, merge, scan, share, Subject, tap } from 'rxjs';
import { createCapacitor } from './capacitor-operator';

class CapacitorScope {
    constructor() {
        [this.capacitorOperator, this.capacitorComponentRenderProps] = createCapacitor();
    }

    // Return a capacitor operator to the parent context.
    getData = () => [this.capacitorOperator];

    // Return the created component render properties to the parent context.
    getComponentRenderProps = () => [this.capacitorComponentRenderProps];
}

class EntryScope {
    constructor({ name }) {
        this.name = name;
        this.entry = new Subject();
    }

    // Pass the created entry subject to the parent context.
    getData = () => [this.entry];

    // Return the created entry subject with or without its name.
    getEntries = () => this.name ? [{ name: this.name, subject: this.entry }] : [{ subject: this.entry }];
}

class ExitScope {
    constructor({ name }) {
        this.name = name;
        this.exit = new Subject();
    }

    // Connect any existing child entry subject to the created exit subject and return it with or without its name.
    getExits = ({ exits, entries }) => {
        entries.forEach(entry => this.exit.subscribe(entry.subject));
        return this.name ? [...exits, { name: this.name, subject: this.exit }] : [...exits, { subject: this.exit }];
    }

    // Return the created component render properties to the parent context.
    getComponentRenderProps = ({ componentRenderProps }) => [...componentRenderProps];
}

class FilterScope {
    constructor({ predicate }) { this.predicate = predicate; }

    // Return a filter operator to the parent context.
    getData = () => [filter(this.predicate)];
}

class IntervalScope {
    constructor({ period }) { this.period = period; }

    // Return an interval operator to the parent context.
    getData = () => [interval(this.period)];
}

class MapScope {
    constructor({ project }) { this.project = project; }

    // Return a map operator to the parent context.
    getData = () => [map(this.project)];
}

class MergeScope {
    // Merge the observables coming from the children.
    getData = ({ data, exits }) => {
        if (exits.length > 0) {
            throw new Error('Exit subjects cannot be present under a \'Stream.Merge\' node!');
        }
        return [merge(...data)];
    }

    // Return the entries and component render properties to the parent context.
    getEntries = ({ entries }) => [...entries];
    getComponentRenderProps = ({ componentRenderProps }) => [...componentRenderProps];
}

class PipeScope {
    getData = ({ data, exits }) => {
        const [observable, ...operators] = data;
        if (!observable) { throw new Error('Initial observable not defined for pipe!'); }

        const resultObs = observable.pipe(...operators);
        if (exits.length > 0) {
            resultObs.pipe(share()).subscribe(exits[exits.length - 1].subject);
            return [];
        }
        return [resultObs];
    };

    // Return the entries, exits and component render properties to the parent context.
    getEntries = ({ entries }) => [...entries];
    getExits = ({ exits }) => [...exits];
    getComponentRenderProps = ({ componentRenderProps }) => [...componentRenderProps];
}

class ScanScope {
    constructor({ accumulator, seed }) {
        this.accumulator = accumulator;
        this.seed = seed;
    }
    getData = () => [scan(this.accumulator, this.seed)];
}

class StreamScope {
    constructor({ name }) { this.name = name; }

    getData = ({ entries, exits, componentRenderProps }) => {
        const streamObj = {
            name: this.name,
            inputs: {},
            outputs: {},
            componentRenderProps: [...componentRenderProps]
        };

        entries.forEach(entry => {
            if (entry.name) {
                if (entry.name in streamObj.inputs) {
                    throw new Error('Input with name \'' + entry.name + '\' already defined for stream \'' + this.name + '\'!');
                }
                streamObj.inputs[entry.name] = entry.subject;
            }
        });

        exits.forEach(exit => {
            if (exit.name) {
                if (exit.name in streamObj.outputs) {
                    throw new Error('Output with name \'' + exit.name + '\' already defined for stream \'' + this.name + '\'!');
                }
                streamObj.outputs[exit.name] = exit.subject;
            }
        });

        return [streamObj];
    }
}

class TapScope {
    constructor({ nextHandler }) { this.nextHandler = nextHandler; }

    getData = () => [tap(this.nextHandler)];
}

export class FrontendStreamBuilder {
    constructor() {
        this.scopeTypes = {
            'capacitor': CapacitorScope,
            'entry': EntryScope,
            'exit': ExitScope,
            'filter': FilterScope,
            'interval': IntervalScope,
            'map': MapScope,
            'merge': MergeScope,
            'pipe': PipeScope,
            'scan': ScanScope,
            'stream': StreamScope,
            'tap': TapScope,
        }

        this.stack = [];
        this.stream = null;
    }

    beginScope = (scopeType, params) => {
        if (!this.scopeTypes[scopeType]) {
            throw new Error('Unknown scope type \'' + scopeType + '\'!');
        }
        const ScopeType = this.scopeTypes[scopeType];
        const scope = new ScopeType(params);
        this.stack.push({
            scope: scope,
            context: {
                data: [],
                entries: [],
                exits: [],
                componentRenderProps: []
            }
        });
    }

    endScope = () => {
        const current = this.stack.pop();
        if (!current) {
            throw new Error('StreamBuilder.endScope has no matching StreamBuilder.beginScope!');
        }

        // Retrieve the data/entries/exits from the current scope.
        const currentData = current.scope.getData ? current.scope.getData(current.context) : [];
        const currentEntries = current.scope.getEntries ? current.scope.getEntries(current.context) : [];
        const currentExits = current.scope.getExits ? current.scope.getExits(current.context) : [];
        const currentComponentRenderProps = current.scope.getComponentRenderProps ? current.scope.getComponentRenderProps(current.context) : [];

        if (this.stack.length > 0) {
            // Pass the retrieved data to the parent scope.
            const parent = this.stack[this.stack.length - 1];
            parent.context.data.push(...currentData);
            parent.context.entries.push(...currentEntries);
            parent.context.exits.push(...currentExits);
            parent.context.componentRenderProps.push(...currentComponentRenderProps);
        } else {
            // Retrieve the final result which is the defined stream.
            [this.stream] = currentData;
        }
    }

    visit = (node, parentPath) => {
        this.beginScope(node.type, node.props);
    }

    leave = (node, parentPath) => {
        this.endScope();
    }
}