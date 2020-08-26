import Component from 'src/core/Component';
import { Callback } from 'src/dom/EventDelegate';
import instanceDecoratorFactory from 'src/utils/instanceDecoratorFactory';

type OnArgs = [string, string, Callback<Component>]

export default instanceDecoratorFactory((instance: Component, methodName, eventName: string, selector?: string) => {
    if (typeof (instance as any)[methodName] !== 'function') {
        console.error('Bind decorator should be only applied to a function');
    } else if (!eventName) {
        console.error('Event name must be provided for bind decorator');
    } else {
        const callback: Callback<Component> = (instance as any)[methodName].bind(instance);
        const args: any[] = [eventName];

        if (selector) {
            args.push(selector);
        }
        args.push(callback);

        instance.$on(...args as OnArgs);
    }
});
