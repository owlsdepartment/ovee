import reactive from 'src/decorators/reactive';
import makeReactive from 'src/reactive/makeReactive';
import ReactiveProxy from 'src/reactive/ReactiveProxy';
import createDecoratorsHandler from 'tests/helpers/createDecoratorsHandler';

jest.mock('src/reactive/makeReactive', () => ({
	__esModule: true,
	default: jest.fn(instance => new ReactiveProxy(instance))
}));

describe('@reactive decorator', () => {
	const consoleSpy = spyConsole('error');

	it('logs error when applied on field other than class property', () => {
		const handler = createDecoratorsHandler({ method() {} });

		reactive()(handler, 'method');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toBe(
			'Reactive decorator should be only applied to a property'
		);
	});

	it('calls makeReactive under the hood', () => {
		const handler = createDecoratorsHandler({ field: '' });

		reactive()(handler, 'field');
		handler.init();

		expect(makeReactive).toBeCalledTimes(1);
	});

	it('enables ReactiveProxy for decorated field', () => {
		const enableForSpy = jest.spyOn(ReactiveProxy.prototype, 'enableFor');
		const handler = createDecoratorsHandler({ field: '' });

		reactive()(handler, 'field');
		handler.init();

		expect(enableForSpy).toBeCalledTimes(1);
		expect(enableForSpy.mock.calls[0][0]).toBe('field');
	});

	it('destroyes ReactiveProxy when destructor is called', () => {
		const destroySpy = jest.spyOn(ReactiveProxy.prototype, 'destroy');
		const handler = createDecoratorsHandler({ field: '' });

		reactive()(handler, 'field');
		handler.init();
		handler.destroy();

		expect(destroySpy).toBeCalledTimes(1);
	});
});
