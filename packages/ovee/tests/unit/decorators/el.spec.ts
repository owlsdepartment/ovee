import { WithElements } from 'src/core/types';
import el from 'src/decorators/el';
import createDecoratorsHandler from 'tests/helpers/createDecoratorsHandler';

const createHandler = <T extends object>(obj: T) => {
	const $element = document.createElement('div');
	const child = document.createElement('div');

	$element.appendChild(child);
	child.classList.add('el-test');

	return createDecoratorsHandler(obj as T & WithElements, { $element, _child: child });
};

describe('@el decorator', () => {
	const consoleSpy = spyConsole('error');

	it('logs error when applied on field other than class property', () => {
		const handler = createHandler({ method() {} });

		el('div')(handler, 'method');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toBe(
			'El decorator should be only applied to a property'
		);
	});

	it("logs error when selector wasn't provided", () => {
		const handler = createHandler({ field: '' });

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		el()(handler, 'field');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toBe('Selector must be provided for el decorator');
	});

	it('binds element to a field based on a selector', () => {
		const handler = createHandler({ field: '' });

		el('.el-test')(handler, 'field');
		handler.init();

		expect(handler.field).toBe(handler._child);
	});

	it('updates field when parent structure was changed', async () => {
		const handler = createHandler({ field: '' });

		el('.el-test')(handler, 'field');
		handler.init();
		handler.$element.removeChild(handler._child);
		await flushPromises();

		expect(handler.field).toBe(null);

		const newChild = document.createElement('p');

		newChild.classList.add('el-test');
		handler.$element.appendChild(newChild);
		await flushPromises();

		expect(handler.field).toBe(newChild);
	});

	it('binds array of results when used with option `list: true`', async () => {
		const handler = createHandler({ field: (null as unknown) as NodeList });

		el('.el-test', { list: true })(handler, 'field');
		handler.init();

		expect(handler.field).toBeInstanceOf(NodeList);
		expect(handler.field.length).toEqual(1);
		expect(handler.field.item(0)).toBe(handler._child);

		const newChild = document.createElement('p');

		newChild.classList.add('el-test');
		handler.$element.appendChild(newChild);
		await flushPromises();

		expect(handler.field).toBeInstanceOf(NodeList);
		expect(handler.field.length).toEqual(2);
		expect(handler.field.item(0)).toBe(handler._child);
		expect(handler.field.item(1)).toBe(newChild);
	});

	it("don't override when used on multiple properties", () => {
		const handler = createHandler({ field_1: null, field_2: null });
		const child = document.createElement('div');

		handler.$element.appendChild(child);
		child.classList.add('el-test-2');

		el('.el-test')(handler, 'field_1');
		el('.el-test-2')(handler, 'field_2');
		handler.init();

		expect(handler.__els).toHaveProperty('field_1');
		expect(handler.__els?.field_1).toBeInstanceOf(Function);
		expect(handler.__els).toHaveProperty('field_2');
		expect(handler.__els?.field_2).toBeInstanceOf(Function);
	});

	it('disconnects observer on destroy', () => {
		const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
		const handler = createHandler({ field: '' });

		el('.el-test')(handler, 'field');
		handler.init();
		handler.destroy();

		expect(disconnectSpy).toHaveBeenCalledTimes(1);
	});
});
