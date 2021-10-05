import { reactive } from 'src/decorators';
import { makeComponentReactive, ReactiveProxy } from 'src/reactive';
import { createDecoratorsHandler, createLoggerRegExp } from 'tests/helpers';

jest.mock('src/reactive/makeComponentReactive', () => {
	const originalModule = jest.requireActual('src/reactive/makeComponentReactive');

	return {
		__esModule: true,
		...originalModule,
		makeComponentReactive: jest.fn(originalModule.makeComponentReactive),
	};
});

describe('@reactive decorator', () => {
	const consoleSpy = spyConsole('error');

	beforeEach(() => {
		(makeComponentReactive as jest.Mock).mockClear();
	});

	it('logs error when applied on field other than class property', () => {
		const handler = createDecoratorsHandler({ method() {} });

		reactive()(handler, 'method');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toMatch(createLoggerRegExp('@reactive'));
	});

	it('calls makeComponentReactive under the hood', () => {
		const handler = createDecoratorsHandler({ field: '' });

		reactive()(handler, 'field');
		handler.init();

		expect(makeComponentReactive).toBeCalledTimes(1);
	});

	it('enables ReactiveProxy for decorated field', () => {
		const enableForSpy = jest.spyOn(ReactiveProxy.prototype, 'enableFor');
		const handler = createDecoratorsHandler({ field: '' });

		reactive()(handler, 'field');
		handler.init();

		expect(enableForSpy).toBeCalledTimes(1);
		expect(enableForSpy.mock.calls[0][0]).toBe('field');
	});
});
