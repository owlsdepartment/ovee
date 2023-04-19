import { ReactiveProxy } from 'src/reactive/ReactiveProxy';

describe('ReactiveProxy class', () => {
	it('should attach a property to proxy', () => {
		const target = {
			foo: 'bar',
			baz: 'qux',
		};

		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.enableFor('foo');

		expect(reactiveProxy.enabledProps.includes('foo')).toBeTruthy();
		expect(Reflect.get(reactiveProxy.proxy, 'foo')).toBe('bar');
	});

	it('should not attach property twice', () => {
		const target = {
			foo: 'bar',
		};

		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.enableFor('foo');
		reactiveProxy.enableFor('foo');

		expect(reactiveProxy.enabledProps.length).toBe(1);
	});

	it('target property value should reflect to proxy property value', () => {
		const INITIAL_VALUE = 'bar';
		const NEW_VALUE = 'baz';
		const target = {
			foo: 'bar',
		};
		const reactiveProxy = new ReactiveProxy(target);

		reactiveProxy.enableFor('foo');

		expect(reactiveProxy.proxy.foo).toBe(INITIAL_VALUE);

		reactiveProxy.proxy.foo = NEW_VALUE;

		expect(target.foo).toBe(NEW_VALUE);

		target.foo = INITIAL_VALUE;

		expect(reactiveProxy.proxy.foo).toBe(INITIAL_VALUE);
	});

	it('keeps target filed descriptor config', () => {
		const target = {
			configurable: 'bar',
			enumerable: 'baz',
		};

		Object.defineProperty(target, 'configurable', {
			configurable: false,
			value: 'bar',
		});
		Object.defineProperty(target, 'enumerable', {
			enumerable: false,
			value: 'bar',
		});

		const proxy = new ReactiveProxy(target);
		proxy.enableFor('foo');

		expect(Object.getOwnPropertyDescriptor(target, 'configurable')?.configurable).toBe(false);
		expect(Object.getOwnPropertyDescriptor(target, 'enumerable')?.enumerable).toBe(false);
	});
});
