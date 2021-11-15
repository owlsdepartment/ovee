import { prop } from 'src/decorators/prop';
import { createDecoratorsHandler, createLoggerRegExp } from 'tests/helpers';

const createHandler = <T extends object>(obj: T) =>
	createDecoratorsHandler(obj, { $element: document.createElement('div') });

describe('@prop decorator', () => {
	const consoleSpy = spyConsole('error');

	it('logs error when applied on field other than class property', () => {
		const handler = createHandler({ method() {} });

		prop()(handler, 'method');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toMatch(createLoggerRegExp('@prop'));
	});

	it('copies element current value to instance field', () => {
		const handler = createHandler({ clientHeight: null });

		prop()(handler, 'clientHeight');
		handler.init();

		expect(handler.clientHeight).toBe(0);
	});

	it('returns proper value from original element', () => {
		const handler = createHandler({ innerText: null });
		const NEW_VAL = 'test text';

		prop()(handler, 'innerText');
		handler.init();

		expect(handler.$element.innerText).toBe(undefined);

		handler.$element.innerText = NEW_VAL;

		expect(handler.$element.innerText).toBe(NEW_VAL);
	});

	it('updates instance field accordingly to elements field', () => {
		const handler = createHandler({ scrollTop: 0 });
		const NEW_VAL = 100;

		prop()(handler, 'scrollTop');
		handler.init();

		handler.$element.scrollTop = NEW_VAL;

		expect(handler.scrollTop).toBe(NEW_VAL);
	});

	it('allows to specify different field name and element property', () => {
		const handler = createHandler({ scroll: 0 });
		const NEW_VAL = 100;

		prop('scrollTop')(handler, 'scroll');
		handler.init();

		handler.$element.scrollTop = NEW_VAL;

		expect(handler.scroll).toBe(NEW_VAL);
	});
});
