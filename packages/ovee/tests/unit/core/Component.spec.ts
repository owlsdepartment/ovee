/* eslint-disable max-classes-per-file */
import { JSDOM } from 'jsdom';

import App from 'src/core/App';
import Component from 'src/core/Component';
import * as protectedFields from 'src/core/protectedFields';
import EventDelegate from 'src/dom/EventDelegate';
import attachMutationObserver from 'src/utils/attachMutationObserver';
import registerCustomElement from 'src/utils/registerCustomElement';

jest.mock('../../../src/core/App');
jest.mock('../../../src/dom/EventDelegate');
jest.mock('../../../src/utils/attachMutationObserver');
jest.mock('src/utils/registerCustomElement');

const dom = new JSDOM('<!DOCTYPE html>');

describe('Component class', () => {
    let _orgMutationObserver: typeof MutationObserver;

    beforeAll(() => {
        _orgMutationObserver = window.MutationObserver;
        window.MutationObserver = jest.fn();
        (window.MutationObserver as jest.Mock).mockImplementation(() => ({
            disconnect: jest.fn(),
            observe: jest.fn()
        }));

        (EventDelegate as jest.Mock).mockImplementation(() => ({
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            destroy: jest.fn()
        }));

        (attachMutationObserver as jest.Mock).mockImplementation(() => ({
            observe: jest.fn(),
            disconnect: jest.fn(),
            takeRecords: jest.fn()
        }));
    });

    afterAll(() => {
        window.MutationObserver = _orgMutationObserver;
    });

    beforeEach(() => {
        (App as jest.Mock).mockClear();
        (EventDelegate as jest.Mock).mockClear();
        (attachMutationObserver as jest.Mock).mockClear();
    });

    it('should set element passed to constructor as $element property', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();
        const options = {};

        const component = new Component(element, app, options);

        expect(component.$element).toBe(element);
    });

    it('should set app passed to constructor as $app property', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();
        const options = {};

        const component = new Component(element, app, options);

        expect(component.$app).toBeInstanceOf(App);
        expect(component.$app).toBe(app);
    });

    it('should set options passed to constructor as $options property including default options', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();
        const options = {
            dolor: 'lorem',
            foo: 'bar'
        };
        const defaultOptions = {
            lorem: 'ipsum',
            dolor: 'sit amet'
        };

        const component = new (class extends Component {
            static defaultOptions() {
                return defaultOptions;
            }
        })(element, app, options);

        expect(component.$options).toBeInstanceOf(Object);
        expect(Object.keys(component.$options).length).toBe(3);
        expect((component.$options as any).dolor).toBe(options.dolor);
        expect((component.$options as any).foo).toBe(options.foo);
        expect((component.$options as any).lorem).toBe(defaultOptions.lorem);
    });

    it('should return default options object', () => {
        const defaultOptions = Component.defaultOptions();

        expect(defaultOptions).toBeInstanceOf(Object);
    });

    it('should call instance decorators', async () => {
        asyncHelper(async (calls) => {
            const element = dom.window.document.createElement('div');
            const app = new App();
            const decorator1 = jest.fn();
            const decorator2 = jest.fn();

            const C = class extends Component { };
            (C.prototype.constructor as any)[protectedFields.INSTANCE_DECORATORS] = [
                decorator1, decorator2
            ];

            const instance = new C(element, app);

            await calls();

            expect(decorator1).toHaveBeenCalledTimes(1);
            expect(decorator1).toHaveBeenCalledWith(instance);
            expect(decorator2).toHaveBeenCalledTimes(1);
            expect(decorator2).toHaveBeenCalledWith(instance);
        });
    });

    it('should set $refs object with refs found in dom', () => {
        const element = dom.window.document.createElement('div');
        const ref11 = dom.window.document.createElement('div');
        const ref12 = dom.window.document.createElement('div');
        const ref21 = dom.window.document.createElement('div');
        const app = new App();

        ref11.setAttribute('ref', 'ref1');
        ref12.setAttribute('ref', 'ref1');
        ref21.setAttribute('ref', 'ref2');

        element.appendChild(ref11);
        element.appendChild(ref12);
        element.appendChild(ref21);

        const instance = new Component(element, app);

        expect(instance.$refs.ref1).toBeInstanceOf(Array);
        expect(instance.$refs.ref2).toBeInstanceOf(Array);
        expect(instance.$refs.ref1.length).toBe(2);
        expect(instance.$refs.ref2.length).toBe(1);
        expect(instance.$refs.ref1.includes(ref11)).toBeTruthy();
        expect(instance.$refs.ref1.includes(ref12)).toBeTruthy();
        expect(instance.$refs.ref1.includes(ref21)).not.toBeTruthy();
        expect(instance.$refs.ref2.includes(ref11)).not.toBeTruthy();
        expect(instance.$refs.ref2.includes(ref12)).not.toBeTruthy();
        expect(instance.$refs.ref2.includes(ref21)).toBeTruthy();
    });

    it('should ignore refs from nested components', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();

        element.innerHTML = `
            <div class="ovee-component">
                <div ref="ref1"></div>
            </div>
        `;

        const instance = new Component(element, app);

        expect(instance.$refs.ref1).toBeInstanceOf(Array);
        expect(instance.$refs.ref2.length).toBe(0);
    });

    it('should track refs changes in dom', () => {
        const element = dom.window.document.createElement('div');
        const ref1 = dom.window.document.createElement('div');
        const notARef = dom.window.document.createElement('div');
        const app = new App();

        ref1.setAttribute('ref', 'ref1');
        element.appendChild(ref1);
        element.appendChild(notARef);

        const instance = new Component(element, app);
        const observer = attachMutationObserver as jest.Mock;

        expect(observer).toHaveBeenCalledTimes(1);
        expect(observer.mock.calls[0][0]).toBe(element);
        expect(observer.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(observer.mock.calls[0][2]).toBeInstanceOf(Function);

        observer.mock.calls[0][1](element.querySelectorAll('div'));

        expect(instance.$refs.ref1).toBeInstanceOf(Array);
        expect(instance.$refs.ref1[0]).toBe(ref1);
    });

    it('should register event listeners with $on', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();

        const events = 'click';
        const target = dom.window.document.createElement('div');
        const selector = '.meh';
        const callback = jest.fn();

        const instance = new Component(element, app);
        instance.$on(events, target, selector, callback);

        expect(instance.$eventDelegate.on).toHaveBeenCalledTimes(1);
        expect(instance.$eventDelegate.on).toHaveBeenCalledWith(events, target, selector, callback);
    });

    it('should unregister event listeners with $off', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();

        const events = 'click';
        const target = dom.window.document.createElement('div');
        const selector = '.meh';
        const callback = jest.fn();

        const instance = new Component(element, app);
        instance.$off(events, target, selector, callback);

        expect(instance.$eventDelegate.off).toHaveBeenCalledTimes(1);
        expect(instance.$eventDelegate.off).toHaveBeenCalledWith(events, target, selector, callback);
    });

    it('should register custom element after call register()', () => {
        class CustomComponent extends Component {
            static getName() {
                return 'custom-component';
            }
        }
        CustomComponent.register();

        const mock = registerCustomElement as jest.Mock;

        expect(mock).toHaveBeenCalledTimes(1);
        expect(typeof mock.mock.calls[0][0]).toBe('function');
        expect(mock.mock.calls[0][1]).toBe('custom-component');
        expect(mock.mock.calls[0][2]).toBe('div');
    });

    it('should emit event from $emit', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();
        const eventDesc = 'click';
        const detail = {};

        const instance = new Component(element, app);
        instance.$emit(eventDesc, detail);

        expect(instance.$eventDelegate.emit).toHaveBeenCalledTimes(1);
        expect(instance.$eventDelegate.emit).toHaveBeenCalledWith(eventDesc, detail);
    });

    it('should destroy event listeners from $destroy', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();

        const instance = new Component(element, app);
        instance.$destroy();

        expect(instance.$eventDelegate.destroy).toHaveBeenCalledTimes(1);
    });

    it('should call destroy method from $destroy', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();
        const destroy = jest.fn();
        const C = class extends Component { };
        C.prototype.destroy = destroy;

        const instance = new C(element, app);
        instance.$destroy();

        expect(destroy).toHaveBeenCalledTimes(1);
    });

    it('should call instance decorator destructors from $destroy', () => {
        const element = dom.window.document.createElement('div');
        const app = new App();
        const destructor1 = jest.fn();
        const destructor2 = jest.fn();

        const C = class extends Component { };
        (C.prototype.constructor as any)[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS] = [
            destructor1, destructor2
        ];

        const instance = new C(element, app);
        instance.$destroy();

        expect(destructor1).toHaveBeenCalledTimes(1);
        expect(destructor1).toHaveBeenCalledWith(instance);
        expect(destructor2).toHaveBeenCalledTimes(1);
        expect(destructor2).toHaveBeenCalledWith(instance);
    });

    it('should throw error if getName() static method is not implemented', () => {
        expect(() => {
            Component.getName();
        }).toThrow('Component class needs to implement static getName() method');
    });
});
