import { ComponentTreeNodeSearchByTypes } from "@sytes/componenttree";

export class FrontendStreamSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('frontend-module', 'streams', 'stream');
    }
}

export class FrontendPartSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('frontend-module', 'parts', 'part');
    }
}

export class FrontendPartPropertyConnectorSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('part', 'property-connector');
    }
}

export class FrontendPartEventConnectorSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('part', 'event-connector');
    }
}

export class FrontendPartRenderingSearch extends ComponentTreeNodeSearchByTypes {
    constructor() {
        super('part', 'rendering');
    }
}