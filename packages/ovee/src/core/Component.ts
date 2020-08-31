// eslint-disable-next-line max-classes-per-file
import {
    OveeElement, WithInstanceDecorators, WithInstanceDestructors, WithReactiveProxy, WithDataParam, WithElements
} from 'src/core/types';
import EventDelegate, { Callback, EventDesc } from 'src/dom/EventDelegate';
import ReactiveProxy from 'src/reactive/ReactiveProxy';
import attachMutationObserver, { MutationCallback } from 'src/utils/attachMutationObserver';
import isValidNode from 'src/utils/isValidNode';
import registerCustomElement from 'src/utils/registerCustomElement';
import toKebabCase from 'src/utils/toKebabCase';
import { Dictionary } from 'src/utils/types';

import App from './App';
import * as protectedFields from './protectedFields';

export interface ComponentOptions {}

export default class Component
implements WithInstanceDecorators, WithInstanceDestructors, WithReactiveProxy, WithDataParam, WithElements {
    readonly $element!: Element;
    readonly $app!: App;
    readonly $options!: ComponentOptions;
    readonly $eventDelegate!: EventDelegate<this>;
    readonly $refs!: Dictionary<Element[]>;

    [protectedFields.REFS]: Dictionary<Element[]> = {};
    [protectedFields.REFS_OBSERVER]: MutationObserver;
    [protectedFields.INSTANCE_DECORATORS]?: ((ctx: this) => any)[];
    [protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]: ((ctx: this) => any)[];
    __reactiveProxy?: ReactiveProxy;
    __dataParams?: Dictionary<() => void>;
    __els?: Dictionary<() => void>;

    constructor(element: Element, app: App, options: ComponentOptions = {}) {
        Object.defineProperty(this, '$element', {
            value: element,
            writable: false,
            configurable: false
        });

        Object.defineProperty(this, '$app', {
            value: app,
            writable: false,
            configurable: false
        });

        Object.defineProperty(this, '$options', {
            value: {
                ...(this.constructor as typeof Component).defaultOptions(),
                ...options
            },
            writable: false,
            configurable: false
        });

        Object.defineProperty(this, '$eventDelegate', {
            value: new EventDelegate(element, this),
            writable: false,
            configurable: false
        });

        const refsProxy = new Proxy({}, {
            get: (target, key: number | string) => (this[protectedFields.REFS][key] ?? [])
        });

        Object.defineProperty(this, '$refs', {
            value: refsProxy,
            writable: false,
            configurable: false
        });

        this[protectedFields.UPDATE_REFS]();
        this[protectedFields.TRACK_REFS]();

        // we need to postpone further initialization
        // to allow properties to get defined
        // before decorators are ran
        setTimeout(async () => {
            await this[protectedFields.BEFORE_INIT]();
            this.init();
        });
    }

    async [protectedFields.BEFORE_INIT](): Promise<void> {
        if (this[protectedFields.INSTANCE_DECORATORS]) {
            this[protectedFields.INSTANCE_DECORATORS]!.forEach((fn) => fn(this));
            delete this[protectedFields.INSTANCE_DECORATORS];
        }
    }

    [protectedFields.UPDATE_REFS](): void {
        const refsObj: Dictionary<Element[]> = {};

        this.$element.querySelectorAll(':not(.ovee-component) [ref]')
            .forEach((el) => {
                const refKey = el.getAttribute('ref');

                if (!refKey) {
                    return;
                }

                if (!refsObj[refKey]) {
                    refsObj[refKey] = [];
                }

                refsObj[refKey].push(el);
            });

        this[protectedFields.REFS] = refsObj;
    }

    [protectedFields.TRACK_REFS](): void {
        const selector = '[ref]';

        const _mutationHook: MutationCallback = (affectedNodes) => {
            const matches = Array.from(affectedNodes)
                .filter(isValidNode)
                .some((node) => node.matches(selector) || node.querySelector(selector));

            if (matches) {
                this[protectedFields.UPDATE_REFS]();
            }
        };

        this[protectedFields.REFS_OBSERVER] = attachMutationObserver(this.$element, _mutationHook, _mutationHook);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    beforeDestroy(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    destroy(): void {}

    $on(events: string, callback: Callback<this>): this;
    $on(events: string, selector: string, callback: Callback<this>): this;
    $on(events: string, target: Element, callback: Callback<this>): this;
    $on(events: string, target: Element, selector: string, callback: Callback<this>): this;
    $on(events: any, target: any, selector?: any, callback?: any): this {
        this.$eventDelegate.on(events, target, selector, callback);

        return this;
    }

    $off(events: string, callback: Callback<this>): this;
    $off(events: string, selector: string, callback: Callback<this>): this;
    $off(events: string, target: Element, callback: Callback<this>): this;
    $off(events: string, target: Element, selector: string, callback: Callback<this>): this;
    $off(events: any, target: any, selector?: any, callback?: any): this {
        this.$eventDelegate.off(events, target, selector, callback);

        return this;
    }

    $emit<D = any>(eventDesc: EventDesc, detail: D): void {
        this.$eventDelegate.emit(eventDesc, detail);
    }

    $destroy(): void {
        this.beforeDestroy();

        this.$eventDelegate.destroy();

        if (this[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]) {
            this[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS].forEach((fn) => fn(this));
            delete this[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS];
        }

        this[protectedFields.REFS_OBSERVER].disconnect();

        this.destroy();
    }

    static defaultOptions(): ComponentOptions {
        return {};
    }

    static register(): void {
        const target = this.prototype;

        registerCustomElement(class extends HTMLElement implements OveeElement {
            _isOveeCustomElement = true
            _OveeComponent = target
        }, toKebabCase(this.getName()), 'div');
    }

    static getName(): string {
        throw new Error('Component class needs to implement static getName() method');
    }
}
