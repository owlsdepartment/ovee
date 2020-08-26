import Component from 'src/core/Component';

export default class ComponentError extends Error {
    readonly element!: Element;
    readonly component?: Component;

    constructor(message: string, element: Element, component?: Component) {
        super(message);

        Error.captureStackTrace(this, ComponentError);
        Object.defineProperties(this, {
            element: {
                writable: false,
                configurable: false,
                value: element
            },
            component: {
                writable: false,
                configurable: false,
                value: component
            }
        });
    }
}
