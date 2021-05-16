import Component from 'src/core/Component';
import ReactiveProxy from 'src/reactive/ReactiveProxy';

import { Dictionary } from '../utils/types';

export interface OveeElement {
    _isOveeCustomElement: boolean;
    _OveeComponent: Component;
}

export interface OveeComponent {
    _oveeComponentInstance?: Component;
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
