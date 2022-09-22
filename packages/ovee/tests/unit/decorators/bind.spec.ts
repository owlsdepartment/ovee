import { bind } from 'src/decorators/bind';
import { createDecoratorsHandler, createLoggerRegExp } from 'tests/helpers';

describe('@bind decorator', () => {
	const consoleSpy = spyConsole('error');

	it('logs namespaced error when applied on field other than method', () => {
		const handler = createDecoratorsHandler({ field: '' });

		bind('')(handler, 'field');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toMatch(createLoggerRegExp('@bind'));
	});

	it(`logs namespaced error when name wasn't passed`, () => {
		const handler = createDecoratorsHandler({ method() {} });

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		bind()(handler, 'method');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toMatch(createLoggerRegExp('@bind'));
	});

	it('binds event on component using $on method', () => {
		const handler = createDecoratorsHandler({
			method() {},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			$on(event: string, callback: any) {},
		});
		const onSpy = jest.spyOn(handler, '$on');

		bind('event')(handler, 'method');
		handler.init();

		expect(onSpy).toHaveBeenCalledTimes(1);
		expect(onSpy.mock.calls[0][0]).toBe('event');
	});

	it('passes selector to components $on method', () => {
		const handler = createDecoratorsHandler({
			method() {},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			$on(event: string, callback: any, options?: any) {},
		});
		const onSpy = jest.spyOn(handler, '$on');
		const options = { target: 'test', once: true };

		bind('event', options)(handler, 'method');
		handler.init();

		expect(onSpy).toHaveBeenCalledTimes(1);
		expect(onSpy.mock.calls[0][0]).toBe('event');
		expect(onSpy.mock.calls[0][2]).toBe(options);
	});
});
