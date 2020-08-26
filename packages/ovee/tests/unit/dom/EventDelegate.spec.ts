// eslint-disable-next-line import/no-extraneous-dependencies
import { JSDOM } from 'jsdom';

import AppEvent from 'src/dom/AppEvent';
import EventDelegate from 'src/dom/EventDelegate';

jest.mock('../../../src/dom/AppEvent');

const dom = new JSDOM('<!DOCTYPE html>');
const createEventDelegate = (target: Element): EventDelegate<any> => new EventDelegate(target, {} as any);

describe('EventDelegate class', () => {
    beforeEach(() => {
        (AppEvent as jest.Mock).mockReset();
    });

    it('should register event listener on default target if no selector nor target passed', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        eventDelegate.on('foo', listener);

        const addListenerMock = target.addEventListener as jest.Mock;

        expect(addListenerMock).toBeCalledTimes(1);
        expect(addListenerMock.mock.calls[0][0]).toBe('foo');
        expect(addListenerMock.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(addListenerMock.mock.calls[0][2]).toEqual({ capture: false });
        expect(eventDelegate.listeners.length).toBe(1);
        expect(eventDelegate.listeners[0].event).toBe('foo');
        expect(eventDelegate.listeners[0].target).toBe(target);
        expect(eventDelegate.listeners[0].selector).toBeUndefined();
        expect(eventDelegate.listeners[0].callback).toBe(listener);
    });

    it('should register event listener on default target with selector if no target passed', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        eventDelegate.on('foo', '.bar', listener);

        const addListenerMock = target.addEventListener as jest.Mock;

        expect(addListenerMock).toBeCalledTimes(1);
        expect(addListenerMock.mock.calls[0][0]).toBe('foo');
        expect(addListenerMock.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(addListenerMock.mock.calls[0][2]).toEqual({ capture: true });
        expect(eventDelegate.listeners.length).toBe(1);
        expect(eventDelegate.listeners[0].event).toBe('foo');
        expect(eventDelegate.listeners[0].target).toBe(target);
        expect(eventDelegate.listeners[0].selector).toBe('.bar');
        expect(eventDelegate.listeners[0].callback).toBe(listener);
    });

    it('should register event listener on custom target with no selector if no selector passed', () => {
        const target = dom.window.document.createElement('div');
        const customTarget = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        customTarget.addEventListener = jest.fn();

        eventDelegate.on('foo', customTarget, listener);

        const addListenerMock = customTarget.addEventListener as jest.Mock;

        expect(target.addEventListener).not.toBeCalled();
        expect(addListenerMock).toBeCalledTimes(1);
        expect(addListenerMock.mock.calls[0][0]).toBe('foo');
        expect(addListenerMock.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(addListenerMock.mock.calls[0][2]).toEqual({ capture: false });
        expect(eventDelegate.listeners.length).toBe(1);
        expect(eventDelegate.listeners[0].event).toBe('foo');
        expect(eventDelegate.listeners[0].target).toBe(customTarget);
        expect(eventDelegate.listeners[0].selector).toBeUndefined();
        expect(eventDelegate.listeners[0].callback).toBe(listener);
    });

    it('should register event listener on custom target with selector', () => {
        const target = dom.window.document.createElement('div');
        const customTarget = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        customTarget.addEventListener = jest.fn();

        eventDelegate.on('foo', customTarget, '.bar', listener);

        const addListenerMock = customTarget.addEventListener as jest.Mock;

        expect(target.addEventListener).not.toBeCalled();
        expect(addListenerMock).toBeCalledTimes(1);
        expect(addListenerMock.mock.calls[0][0]).toBe('foo');
        expect(addListenerMock.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(addListenerMock.mock.calls[0][2]).toEqual({ capture: true });
        expect(eventDelegate.listeners.length).toBe(1);
        expect(eventDelegate.listeners[0].event).toBe('foo');
        expect(eventDelegate.listeners[0].target).toBe(customTarget);
        expect(eventDelegate.listeners[0].selector).toBe('.bar');
        expect(eventDelegate.listeners[0].callback).toBe(listener);
    });

    it('should register separate event listeners when multiple, space separated events passed', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();

        eventDelegate.on('foo bar', listener);

        const addListenerMock = target.addEventListener as jest.Mock;

        expect(addListenerMock).toBeCalledTimes(2);
        expect(addListenerMock.mock.calls[0][0]).toBe('foo');
        expect(addListenerMock.mock.calls[1][0]).toBe('bar');
        expect(eventDelegate.listeners.length).toBe(2);
        expect(eventDelegate.listeners[0].event).toBe('foo');
        expect(eventDelegate.listeners[0].callback).toBe(listener);
        expect(eventDelegate.listeners[1].event).toBe('bar');
        expect(eventDelegate.listeners[1].callback).toBe(listener);
    });

    it('should unbind event listener registered without custom target nor selector', () => {
        const target = dom.window.document.createElement('div');
        const target2 = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        const listeners = [
            {
                event: 'foo',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'bar',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'foo',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: '.roar',
                callback: listener,
                handler: jest.fn()
            }
        ];
        eventDelegate.listeners = [...listeners];

        target.removeEventListener = jest.fn();
        target2.removeEventListener = jest.fn();

        eventDelegate.off('foo', listener);

        expect(target2.removeEventListener).not.toBeCalled();
        expect(target.removeEventListener).toBeCalledTimes(1);
        expect(target.removeEventListener).toBeCalledWith('foo', listeners[0].handler);
        expect(eventDelegate.listeners.includes(listeners[0])).toBeFalsy();
        expect(eventDelegate.listeners.length).toBe(listeners.length - 1);
    });

    it('should unbind event listener registered with custom target but without selector', () => {
        const target = dom.window.document.createElement('div');
        const target2 = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        const listeners = [
            {
                event: 'foo',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'bar',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'foo',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: '.roar',
                callback: listener,
                handler: jest.fn()
            }
        ];
        eventDelegate.listeners = [...listeners];

        target.removeEventListener = jest.fn();
        target2.removeEventListener = jest.fn();

        eventDelegate.off('foo', target2, listener);

        expect(target.removeEventListener).not.toBeCalled();
        expect(target2.removeEventListener).toBeCalledTimes(1);
        expect(target2.removeEventListener).toBeCalledWith('foo', listeners[2].handler);
        expect(eventDelegate.listeners.includes(listeners[2])).toBeFalsy();
        expect(eventDelegate.listeners.length).toBe(listeners.length - 1);
    });

    it('should unbind event listener registered with custom selector but without target', () => {
        const target = dom.window.document.createElement('div');
        const target2 = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        const listeners = [
            {
                event: 'foo',
                target,
                selector: '.bar',
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'foo',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'bar',
                target,
                selector: '.bar',
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'foo',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: '.roar',
                callback: listener,
                handler: jest.fn()
            }
        ];
        eventDelegate.listeners = [...listeners];

        target.removeEventListener = jest.fn();
        target2.removeEventListener = jest.fn();

        eventDelegate.off('foo', '.bar', listener);

        expect(target2.removeEventListener).not.toBeCalled();
        expect(target.removeEventListener).toBeCalledTimes(1);
        expect(target.removeEventListener).toBeCalledWith('foo', listeners[0].handler);
        expect(eventDelegate.listeners.includes(listeners[0])).toBeFalsy();
        expect(eventDelegate.listeners.length).toBe(listeners.length - 1);
    });

    it('should unbind event listener registered with custom selector and target', () => {
        const target = dom.window.document.createElement('div');
        const target2 = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        const listeners = [
            {
                event: 'foo',
                target: target2,
                selector: '.bar',
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'foo',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'bar',
                target,
                selector: '.bar',
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'foo',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: '.roar',
                callback: listener,
                handler: jest.fn()
            }
        ];
        eventDelegate.listeners = [...listeners];

        target.removeEventListener = jest.fn();
        target2.removeEventListener = jest.fn();

        eventDelegate.off('foo', target2, '.bar', listener);

        expect(target.removeEventListener).not.toBeCalled();
        expect(target2.removeEventListener).toBeCalledTimes(1);
        expect(target2.removeEventListener).toBeCalledWith('foo', listeners[0].handler);
        expect(eventDelegate.listeners.includes(listeners[0])).toBeFalsy();
        expect(eventDelegate.listeners.length).toBe(listeners.length - 1);
    });

    it('should unbind separate event listeners when multiple, space separated events passed', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        const listeners = [
            {
                event: 'foo',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            },
            {
                event: 'bar',
                target,
                selector: undefined,
                callback: listener,
                handler: jest.fn()
            }
        ];
        eventDelegate.listeners = [...listeners];

        target.removeEventListener = jest.fn();

        eventDelegate.off('bar foo', listener);

        const removeListenerMock = target.removeEventListener as jest.Mock;

        expect(removeListenerMock).toBeCalledTimes(2);
        expect(removeListenerMock.mock.calls[0][0]).toBe('bar');
        expect(removeListenerMock.mock.calls[1][0]).toBe('foo');
        expect(eventDelegate.listeners.length).toBe(0);
    });

    it('should create an event handler that calls proper callback with proper params', () => {
        const target = dom.window.document.createElement('div');
        const context = {};
        const eventDelegate = new EventDelegate(target, context as any);
        const listener = jest.fn();

        target.addEventListener = jest.fn();

        eventDelegate.on('foo', listener);

        const handler = (target.addEventListener as jest.Mock).mock.calls[0][1];

        const args = [{}];

        Reflect.apply(handler, eventDelegate, args);

        expect(handler).toBeInstanceOf(Function);
        expect(listener).toBeCalledTimes(1);
        expect(listener).toBeCalledWith(...args);
        expect(listener.mock.instances[0]).toBe(context);
    });

    it('should create an event handler that checks target selector to match before calling callback', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        target.matches = jest.fn();

        eventDelegate.on('foo', '.bar', listener);

        const handler = (target.addEventListener as jest.Mock).mock.calls[0][1];

        Reflect.apply(handler, eventDelegate, [{
            target
        }]);

        expect(target.matches).toBeCalledTimes(1);
        expect(target.matches).toBeCalledWith('.bar');
    });

    it('should call callback by event handler if target selector matches', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        target.matches = jest.fn()
            .mockImplementationOnce(() => true);

        eventDelegate.on('foo', '.bar', listener);

        const handler = (target.addEventListener as jest.Mock).mock.calls[0][1];

        Reflect.apply(handler, eventDelegate, [{
            target
        }]);

        expect(listener).toBeCalledTimes(1);
    });

    it('should not call callback by event handler if target selector does not match', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const listener = jest.fn();

        target.addEventListener = jest.fn();
        target.matches = jest.fn()
            .mockImplementationOnce(() => false);

        eventDelegate.on('foo', '.bar', listener);

        const handler = (target.addEventListener as jest.Mock).mock.calls[0][1];

        Reflect.apply(handler, eventDelegate, [{
            target
        }]);

        expect(listener).not.toBeCalled();
    });

    it('should dispatch an AppEvent instance when emit called', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);

        target.dispatchEvent = jest.fn();

        eventDelegate.emit('foo', 'bar');

        expect(target.dispatchEvent).toBeCalledTimes(1);
        expect((target.dispatchEvent as jest.Mock).mock.calls[0][0]).toBeInstanceOf(AppEvent);
        expect(AppEvent).toBeCalledTimes(1);
        expect(AppEvent).toBeCalledWith('foo', { detail: 'bar' });
    });

    it('should dispatch custom event instance if passed to emit', () => {
        const target = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);
        const customEvent = new Event('baz');

        target.dispatchEvent = jest.fn();

        eventDelegate.emit(customEvent);

        expect(target.dispatchEvent).toBeCalledWith(customEvent);
        expect(AppEvent).not.toBeCalled();
    });

    it('should unbind all listeners with destroy method', () => {
        const target = dom.window.document.createElement('div');
        const target2 = dom.window.document.createElement('div');
        const eventDelegate = createEventDelegate(target);

        target.removeEventListener = jest.fn();
        target2.removeEventListener = jest.fn();

        const listeners = [
            {
                event: 'foo',
                target,
                selector: '.bar',
                callback: jest.fn(),
                handler: jest.fn()
            },
            {
                event: 'baz',
                target: target2,
                selector: '.yeez',
                callback: jest.fn(),
                handler: jest.fn()
            }
        ];
        eventDelegate.listeners = [...listeners];

        eventDelegate.destroy();

        expect(target.removeEventListener).toBeCalledTimes(1);
        expect(target.removeEventListener).toBeCalledWith(listeners[0].event, listeners[0].handler);
        expect(target2.removeEventListener).toBeCalledTimes(1);
        expect(target2.removeEventListener).toBeCalledWith(listeners[1].event, listeners[1].handler);
        expect(eventDelegate.listeners.length).toBe(0);
    });
});
