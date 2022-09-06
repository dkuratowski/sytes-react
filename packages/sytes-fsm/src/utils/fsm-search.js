import { ComponentTreeNodeSearch } from '@sytes/componenttree';

class FSMSearch extends ComponentTreeNodeSearch {
    constructor(state, ...pathPredicates) {
        super(
            node => node.type === 'fsm',
            ...state.map(stateSegment => (node => node.type === 'state' && node.props && node.props.name === stateSegment)),
            ...pathPredicates
        );
    }
}

export class FSMTransitionSearch extends FSMSearch {
    constructor(state) {
        super(state, node => node.type === 'transition');
    }
}

export class FSMRenderingSearch extends FSMSearch {
    constructor(state) {
        super(state, node => node.type === 'rendering');
    }
}