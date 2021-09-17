import { WithReactiveProxy } from 'src/core';
import watch from 'src/decorators/watch';
import { handleCombinedWatch, ReactiveProxy } from 'src/reactive';
import { createDecoratorsHandler } from 'tests/helpers';

jest.mock('src/reactive/watch/handleCombinedWatch', () => {
	const originalModule = jest.requireActual('src/reactive/watch/handleCombinedWatch');

	return {
		__esModule: true,
		...originalModule,
		handleCombinedWatch: jest.fn((...args: any[]) => {
			return jest.fn(originalModule.handleCombinedWatch(...args));
		}),
	};
});

describe('@watch decorator', () => {
	const spy = spyConsole('error');

	beforeEach(() => {
		(handleCombinedWatch as jest.Mock).mockClear();
	});

	it('logs an error when not applied on a function', () => {
		const handler = createDecoratorsHandler({ field: '' });

		watch('a')(handler, 'field');
		handler.init();

		expect(spy.console).toHaveBeenCalledTimes(1);
		expect(spy.console.mock.calls[0][0]).toBe(
			'Watch decorator should be only applied to a function'
		);
	});

	it('requires path to be passed', () => {
		const handler = createDecoratorsHandler({ method: () => {} });

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		watch()(handler, 'method');
		handler.init();

		expect(spy.console).toHaveBeenCalledTimes(1);
		expect(typeof spy.console.mock.calls[0][0]).toBe('string');
	});

	it('ensures that target is reactive', () => {
		const target = {
			a: '',
			method() {},
		};
		const handler = createDecoratorsHandler(target);

		watch('a')(handler, 'method');
		handler.init();

		expect((handler as WithReactiveProxy).__reactiveProxy).toBeInstanceOf(ReactiveProxy);
	});

	it('passes all arguments to handleCombinedWatch', () => {
		const instance = { method: () => {} };
		const handler = createDecoratorsHandler(instance);
		const source = 'a';
		const options = {};

		watch(source, options)(handler, 'method');
		handler.init();

		expect((handleCombinedWatch as jest.Mock).mock.calls[0][0]).toBe(handler);
		expect((handleCombinedWatch as jest.Mock).mock.calls[0][1]).toBe(source);
		expect((handleCombinedWatch as jest.Mock).mock.calls[0][2]).toBeInstanceOf(Function);
		expect((handleCombinedWatch as jest.Mock).mock.calls[0][3]).toBe(options);
	});

	it(`binds method to 'this' instance`, () => {
		const methodStub = jest.fn();
		const instance = {
			a: {},
			method() {
				methodStub(this.a);
			},
		};
		const handler = createDecoratorsHandler(instance);

		watch('a', { immediate: true })(handler, 'method');
		handler.init();

		expect(methodStub.mock.calls[0][0]).toBe(instance.a);
	});

	it('destroyes watcher when destructor is called', () => {
		const handler = createDecoratorsHandler({
			a: '',
			method() {},
		});

		watch('a')(handler, 'method');
		handler.init();
		handler.destroy();

		expect((handleCombinedWatch as jest.Mock).mock.results[0].value).toBeCalledTimes(1);
	});
});
