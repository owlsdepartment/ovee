import { AppEvent } from 'src/dom/AppEvent';
import { EventDelegate } from 'src/dom/EventDelegate';

const createEventDelegate = (target: Element): EventDelegate<any> => new EventDelegate(target, {});

describe('EventDelegate class', () => {
	const callback = jest.fn();
	let eventDelegate: EventDelegate;
	let target: HTMLDivElement;

	beforeEach(() => {
		target = document.createElement('div');
		eventDelegate = createEventDelegate(target);

		callback.mockReset();
	});

	afterEach(() => {
		eventDelegate.destroy();
		target.remove();
	});

	it(`should increase listeners amount with proper values accordingly to amount of 'on' calls`, () => {
		const elTarget = document.createElement('div');
		const event1 = 'foo';
		const events2 = 'bar baz';

		target.appendChild(document.createElement('div'));

		eventDelegate.on(event1, callback);
		eventDelegate.on(events2, callback, { target: elTarget });
		eventDelegate.on(events2, callback, { target: 'div' });

		expect(eventDelegate.listeners.length).toBe(3);
		expect(eventDelegate.listeners[0].events).toBe(event1);
		expect(eventDelegate.listeners[0].callback).toBe(callback);
		expect(eventDelegate.listeners[0].target).toBe(target);
		expect(eventDelegate.listeners[1].events).toBe(events2);
		expect(eventDelegate.listeners[1].callback).toBe(callback);
		expect(eventDelegate.listeners[1].target).toBe(elTarget);
		expect(eventDelegate.listeners[2].events).toBe(events2);
		expect(eventDelegate.listeners[2].callback).toBe(callback);
		expect(eventDelegate.listeners[2].target).toBe('div');
	});

	it('should register and unregister event listener on default target if no target is passed', () => {
		const addEventSpy = jest.spyOn(target, 'addEventListener');
		const removeEventSpy = jest.spyOn(target, 'removeEventListener');

		eventDelegate.on('foo', callback);
		eventDelegate.off('foo', callback);

		expect(eventDelegate.listeners.length).toBe(0);
		expect(addEventSpy).toBeCalledTimes(1);
		expect(addEventSpy.mock.calls[0][0]).toBe('foo');
		expect(addEventSpy.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(removeEventSpy).toBeCalledTimes(1);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
	});

	it('should register and unregister event listener on proper target element if passed as target', () => {
		const customTarget = document.createElement('div');
		const addEventSpy = jest.spyOn(customTarget, 'addEventListener');
		const removeEventSpy = jest.spyOn(customTarget, 'removeEventListener');
		const addEventTargetSpy = jest.spyOn(target, 'addEventListener');

		eventDelegate.on('foo', callback, { target: customTarget });
		eventDelegate.off('foo', callback, { target: customTarget });

		expect(eventDelegate.listeners.length).toBe(0);
		expect(addEventTargetSpy).not.toBeCalled();
		expect(addEventSpy).toBeCalledTimes(1);
		expect(addEventSpy.mock.calls[0][0]).toBe('foo');
		expect(addEventSpy.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(removeEventSpy).toBeCalledTimes(1);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
	});

	it('should register and unregister event listener on nested element if target is string', () => {
		const testClass = 'nested';
		const nested = document.createElement('div');
		const fake = document.createElement('div');
		const addEventSpy = jest.spyOn(nested, 'addEventListener');
		const removeEventSpy = jest.spyOn(nested, 'removeEventListener');

		nested.classList.add(testClass);
		fake.classList.add(testClass);
		target.appendChild(nested);
		document.body.appendChild(fake);

		eventDelegate.on('foo', callback, { target: `.${testClass}` });
		eventDelegate.off('foo', callback, { target: `.${testClass}` });

		expect(eventDelegate.listeners.length).toBe(0);
		expect(addEventSpy).toBeCalledTimes(1);
		expect(addEventSpy.mock.calls[0][0]).toBe('foo');
		expect(addEventSpy.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(removeEventSpy).toBeCalledTimes(1);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
	});

	it(`should register event listener on proper global target if passed as string and with 'root: true'`, () => {
		const newTarget = document.createElement('div');
		const addEventSpy = jest.spyOn(newTarget, 'addEventListener');
		const removeEventSpy = jest.spyOn(newTarget, 'removeEventListener');
		const addEventTargetSpy = jest.spyOn(target, 'addEventListener');
		const targetClass = 'custom';

		document.body.appendChild(newTarget);
		newTarget.classList.add(targetClass);

		eventDelegate.on('foo', callback, { target: `.${targetClass}`, root: true });
		eventDelegate.off('foo', callback, { target: `.${targetClass}`, root: true });

		expect(eventDelegate.listeners.length).toBe(0);
		expect(addEventTargetSpy).not.toBeCalled();
		expect(addEventSpy).toBeCalledTimes(1);
		expect(addEventSpy.mock.calls[0][0]).toBe('foo');
		expect(addEventSpy.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(removeEventSpy).toBeCalledTimes(1);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
	});

	it('should register and unregister separate event listeners when multiple, space separated events passed', () => {
		const addEventSpy = jest.spyOn(target, 'addEventListener');
		const removeEventSpy = jest.spyOn(target, 'removeEventListener');

		eventDelegate.on('foo bar', callback);
		eventDelegate.off('foo bar', callback);

		expect(eventDelegate.listeners.length).toBe(0);
		expect(addEventSpy).toBeCalledTimes(2);
		expect(addEventSpy.mock.calls[0][0]).toBe('foo');
		expect(addEventSpy.mock.calls[1][0]).toBe('bar');
		expect(removeEventSpy).toBeCalledTimes(2);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
		expect(removeEventSpy.mock.calls[1][0]).toBe('bar');
		expect(removeEventSpy.mock.calls[1][1]).toBe(addEventSpy.mock.calls[1][1]);
	});

	it('should unbind event listener, when returned callback is called', () => {
		const addEventSpy = jest.spyOn(target, 'addEventListener');
		const removeEventSpy = jest.spyOn(target, 'removeEventListener');
		const event = 'foo';
		const cb = eventDelegate.on(event, callback);

		cb();

		expect(eventDelegate.listeners.length).toBe(0);
		expect(removeEventSpy).toBeCalledTimes(1);
		expect(removeEventSpy.mock.calls[0][0]).toBe(event);
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
	});

	it('should unbind event listeners for multiple events, when returned callback is called', () => {
		const addEventSpy = jest.spyOn(target, 'addEventListener');
		const removeEventSpy = jest.spyOn(target, 'removeEventListener');
		const events = 'foo bar baz';
		const cb = eventDelegate.on(events, callback);

		cb();

		expect(eventDelegate.listeners.length).toBe(0);
		expect(removeEventSpy).toBeCalledTimes(3);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);
		expect(removeEventSpy.mock.calls[1][0]).toBe('bar');
		expect(removeEventSpy.mock.calls[1][1]).toBe(addEventSpy.mock.calls[1][1]);
		expect(removeEventSpy.mock.calls[2][0]).toBe('baz');
		expect(removeEventSpy.mock.calls[2][1]).toBe(addEventSpy.mock.calls[2][1]);
	});

	it('should create an event handler that calls proper callback with proper params', () => {
		const addEventSpy = jest.spyOn(target, 'addEventListener');
		const context = eventDelegate.context;

		eventDelegate.on('foo', callback);

		const handler = addEventSpy.mock.calls[0][1] as Function;
		const args = [{}, {}];

		Reflect.apply(handler, eventDelegate, args);

		expect(handler).toBeInstanceOf(Function);
		expect(callback).toBeCalledTimes(1);
		expect(callback).toBeCalledWith(...args);
		expect(callback.mock.instances[0]).toBe(context);
	});

	describe('emit', () => {
		it('should dispatch an AppEvent instance when called', () => {
			const dispatchSpy = jest.spyOn(target, 'dispatchEvent');

			eventDelegate.emit('foo', 'bar');

			const dispatched = dispatchSpy.mock.calls[0][0] as CustomEvent;

			expect(dispatchSpy).toBeCalledTimes(1);
			expect(dispatched).toBeInstanceOf(AppEvent);
			expect(dispatched.type).toBe('foo');
			expect(dispatched.detail).toBe('bar');
		});

		it('should dispatch custom event instance if passed as argument', () => {
			const customEvent = new Event('baz');
			const dispatchSpy = jest.spyOn(target, 'dispatchEvent');

			eventDelegate.emit(customEvent);

			expect(dispatchSpy).toBeCalledWith(customEvent);
		});
	});

	it('should unbind all listeners with destroy method', () => {
		const customTarget = document.createElement('div');
		const addEventSpy = jest.spyOn(target, 'addEventListener');
		const removeEventSpy = jest.spyOn(target, 'removeEventListener');
		const addEventCustomSpy = jest.spyOn(customTarget, 'addEventListener');
		const removeEventCustomSpy = jest.spyOn(customTarget, 'removeEventListener');

		eventDelegate.on('foo', callback);
		eventDelegate.on('foo', callback, { target: customTarget });
		eventDelegate.destroy();

		expect(eventDelegate.listeners.length).toBe(0);

		expect(removeEventSpy).toBeCalledTimes(1);
		expect(removeEventSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventSpy.mock.calls[0][1]).toBe(addEventSpy.mock.calls[0][1]);

		expect(removeEventCustomSpy).toBeCalledTimes(1);
		expect(removeEventCustomSpy.mock.calls[0][0]).toBe('foo');
		expect(removeEventCustomSpy.mock.calls[0][1]).toBe(addEventCustomSpy.mock.calls[0][1]);
	});

	it(`should throw error when element with string selector wasn't found`, () => {
		expect(() => {
			eventDelegate.on('foo', callback, { target: '.not' });
		}).toThrowError();
		expect(() => {
			eventDelegate.on('foo', callback, { target: '.not', root: true });
		}).toThrowError();
	});
});
