import Component from 'src/core/Component';

import emitEvent from './emitEvent';

interface Listener<T extends Component> {
    event: string;
    target: Element;
    selector?: string;
    callback: Callback<T>;
    handler: (...args: any[]) => void;
}

interface CastedParams<C extends Component> {
    events: string;
    target: Element;
    selector?: string;
    callback: Callback<C>;
}

export interface Callback<T extends Component> extends Function {
    (this: T, ...args: any[]): void;
}

export type EventDesc = string | Event;

export default class EventDelegate<Context extends Component> {
    listeners: Listener<Context>[] = [];
    targetElement: Element;
    context: Context;

    constructor(targetElement: Element, context: Context) {
        this.targetElement = targetElement;
        this.context = context;
    }

    on(events: string, callback: Callback<Context>): void;
    on(events: string, selector: string, callback: Callback<Context>): void;
    on(events: string, target: Element, callback: Callback<Context>): void;
    on(events: string, target: Element, selector: string, callback: Callback<Context>): void;
    on(
        _events: string,
        _target: Callback<Context> | string | Element,
        _selector?: Callback<Context> | string,
        _callback?: Callback<Context>
    ): void {
        const {
            events, target, selector, callback
        } = this.getCastedParams(_events, _target, _selector, _callback);

        events.split(' ').forEach((event) => {
            let handler;
            let capture;

            if (selector !== undefined) {
                handler = (...args: any[]) => {
                    const [e] = args;

                    if (e.target && (e.target.matches(selector) || e.target.closest(selector))) {
                        callback.apply(this.context, args);
                    }
                };
                capture = true;
            } else {
                handler = (...args: any[]) => {
                    callback.apply(this.context, args);
                };
                capture = false;
            }

            target.addEventListener(event, handler, { capture });

            this.listeners.push({
                event,
                target,
                selector,
                callback,
                handler
            });
        });
    }

    off(events: string, callback: Callback<Context>): void;
    off(events: string, selector: string, callback: Callback<Context>): void;
    off(events: string, target: Element, callback: Callback<Context>): void;
    off(events: string, target: Element, selector: string, callback: Callback<Context>): void;
    off(
        _events: string,
        _target: Callback<Context> | string | Element,
        _selector?: Callback<Context> | string,
        _callback?: Callback<Context>
    ): void {
        const {
            events, target, selector, callback
        } = this.getCastedParams(_events, _target, _selector, _callback);

        events.split(' ').forEach((event) => {
            this.listeners.forEach((item, index) => {
                if (item.event === event && item.target === target
                    && item.selector === selector && item.callback === callback) {
                    target.removeEventListener(event, item.handler);
                    this.listeners.splice(index, 1);
                }
            });
        });
    }

    private getCastedParams(
        events: string,
        target: Callback<Context> | string | Element,
        selector?: Callback<Context> | string,
        callback?: Callback<Context>
    ) {
        const out: Partial<CastedParams<Context>> = { events, callback };

        if (callback === undefined) {
            if (selector === undefined) {
                out.callback = target as Callback<Context>;
                out.target = this.targetElement;
            } else if (typeof target === 'string') {
                out.callback = selector as Callback<Context>;
                out.selector = target;
                out.target = this.targetElement;
            } else {
                out.callback = selector as Callback<Context>;
                out.target = target as Element;
            }
        } else {
            out.target = target as Element;
            out.selector = selector as string;
        }

        return out as CastedParams<Context>;
    }

    emit<D = any>(eventDesc: EventDesc, detail?: D): void {
        emitEvent(this.targetElement, eventDesc, detail);
    }

    destroy(): void {
        this.listeners = this.listeners.filter((item) => {
            item.target.removeEventListener(item.event, item.handler);
            return false;
        });
    }
}
