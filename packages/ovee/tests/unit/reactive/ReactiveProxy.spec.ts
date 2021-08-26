import _onChange from 'on-change';
import ReactiveProxy from 'src/reactive/ReactiveProxy';

jest.mock('on-change');

const onChange = _onChange as typeof _onChange & jest.Mock;

describe('ReactiveProxy class', () => {
	beforeEach(() => {
		onChange.mockReset();
		onChange.mockImplementation(obj => ({ ...obj }));
	});

	it('should attach a property to proxy', () => {
		const target = {
			foo: 'bar',
			baz: 'qux'
		};

		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.enableFor('foo');

		expect(reactiveProxy.enabledProps.includes('foo')).toBeTruthy();
		expect(Reflect.get(reactiveProxy.proxy, 'foo')).toBe('bar');
	});

	it('should not attach property twice', () => {
		const target = {
			foo: 'bar'
		};

		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.enableFor('foo');
		reactiveProxy.enableFor('foo');

		expect(reactiveProxy.enabledProps.length).toBe(1);
	});

	it('should unsubscribe once from on-change if destroyed', () => {
		const target = {};
		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.destroy();
		reactiveProxy.destroy();

		expect(onChange.unsubscribe).toBeCalledTimes(1);
		expect(onChange.unsubscribe).toBeCalledWith(reactiveProxy.proxy);
	});

	it('target property value should reflect to proxy property value', () => {
		const target = {
			foo: 'bar'
		};
		const proxy = {};
		const get = jest.fn();
		const set = jest.fn();

		Object.defineProperty(proxy, 'foo', {
			get,
			set,
			configurable: true
		});

		onChange.mockReset();
		onChange.mockImplementation(() => proxy);

		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.enableFor('foo');

		get.mockReset();
		set.mockReset();

		target.foo = 'baz';

		expect(set).toBeCalledTimes(1);
		expect(set).toBeCalledWith('baz');

		// eslint-disable-next-line no-unused-vars
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const tmp = target.foo;

		expect(get).toBeCalledTimes(1);
		expect(get).toBeCalledWith();
	});

	it('should call watchers with proper path', () => {
		const reactiveProxy = new ReactiveProxy({});

		const watchers = {
			foo: [jest.fn(), jest.fn()],
			'foo.baz': [jest.fn()],
			'*': [jest.fn()],
			bar: [jest.fn()]
		};

		reactiveProxy.watchers = {
			...watchers
		};

		reactiveProxy.handler('foo.baz', 'jezz', 'tazz');

		expect(watchers.foo[0]).toBeCalledTimes(1);
		expect(watchers.foo[1]).toBeCalledTimes(1);
		expect(watchers['foo.baz'][0]).toBeCalledTimes(1);
		expect(watchers['*'][0]).toBeCalledTimes(1);
		expect(watchers.bar[0]).toBeCalledTimes(0);

		expect(watchers.foo[0]).toBeCalledWith('jezz', 'tazz', 'foo.baz');
	});

	it('should not fail if there are no watchers for property', () => {
		const reactiveProxy = new ReactiveProxy({});

		expect(() => {
			reactiveProxy.handler('foo', 'bar', 'baz');
		}).not.toThrow();
	});

	it('should register watcher for proper path', () => {
		const reactiveProxy = new ReactiveProxy({});
		const callback = jest.fn();
		const callback2 = jest.fn();
		const callback3 = jest.fn();

		reactiveProxy.watch('foo.bar', callback);
		reactiveProxy.watch('foo.bar', callback2);
		reactiveProxy.watch('baz', callback3);

		expect(Object.keys(reactiveProxy.watchers).length).toBe(2);
		expect(reactiveProxy.watchers['foo.bar'].length).toBe(2);
		expect(reactiveProxy.watchers.baz.length).toBe(1);
		expect(reactiveProxy.watchers['foo.bar'].includes(callback)).toBeTruthy();
		expect(reactiveProxy.watchers['foo.bar'].includes(callback2)).toBeTruthy();
		expect(reactiveProxy.watchers['foo.bar'].includes(callback3)).toBeFalsy();
		expect(reactiveProxy.watchers.baz.includes(callback)).toBeFalsy();
		expect(reactiveProxy.watchers.baz.includes(callback2)).toBeFalsy();
		expect(reactiveProxy.watchers.baz.includes(callback3)).toBeTruthy();
	});

	it('should unbind watcher when kill callback called', () => {
		const reactiveProxy = new ReactiveProxy({});
		const callback = jest.fn();

		const killCallback = reactiveProxy.watch('foo', callback);

		killCallback();

		expect(killCallback).toBeInstanceOf(Function);
		expect(reactiveProxy.watchers.foo.length).toBe(0);
	});

	it('should not fail if kill callback called more than once', () => {
		const reactiveProxy = new ReactiveProxy({});
		const callback = jest.fn();

		const killCallback = reactiveProxy.watch('foo', callback);

		expect(() => {
			killCallback();
			killCallback();
			killCallback();
		}).not.toThrow();
	});

	it('should register callback once', () => {
		const reactiveProxy = new ReactiveProxy({});
		const callback = jest.fn();

		reactiveProxy.watch('foo', callback);
		reactiveProxy.watch('foo', callback);

		expect(reactiveProxy.watchers.foo.length).toBe(1);
	});
});
