import Component from 'src/core/Component';
import * as protectedFields from 'src/core/protectedFields';
import { ReactiveProxy } from 'src/reactive/ReactiveProxy';
import { Dictionary } from 'src/utils';

export interface OveeElement {
	_isOveeCustomElement: boolean;
	_OveeComponent: Component;
}

export interface OveeComponent {
	_oveeComponentInstance?: Component;
}

export interface WithReactiveProxy {
	[protectedFields.REACTIVE_PROXY]?: ReactiveProxy;
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
