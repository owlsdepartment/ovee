import Component from 'src/core/Component';
import ReactiveProxy from 'src/reactive/ReactiveProxy';

import { Dictionary } from '../utils/types';
import * as protectedFields from './protectedFields';

export interface OwdElement {
    _isOwdCustomElement: boolean;
    _OwdComponent: Component;
}

export interface OwdComponent {
    _owdComponentInstance?: Component;
}

export interface WithReactiveProxy {
    __reactiveProxy?: ReactiveProxy;
}

export interface WithDataParam {
    __dataParams?: Dictionary<() => void>;
}

export interface WithElements {
    __els?: Dictionary<() => void>;
}

export interface WithElement {
    readonly $element: Element;
}

export interface WithInstanceDecorators {
    [protectedFields.INSTANCE_DECORATORS]?: ((ctx: any) => any)[];
}

export interface WithInstanceDestructors {
    [protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]?: ((ctx: any) => any)[];
}
