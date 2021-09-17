import { WithDataParam } from 'src/core/types';
import dataParam from 'src/decorators/dataParam';
import { createDecoratorsHandler } from 'tests/helpers';

const createHandler = <T extends object>(obj: T) =>
	createDecoratorsHandler(obj, { $element: document.createElement('div') });

describe('@prop decorator', () => {
	const consoleSpy = spyConsole('error');

	it('logs error when applied on field other than class property', () => {
		const handler = createHandler({ method() {} });

		dataParam()(handler, 'method');
		handler.init();

		expect(consoleSpy.console).toHaveBeenCalledTimes(1);
		expect(consoleSpy.console.mock.calls[0][0]).toMatch(/^\[\w+ ~ @dataParam\]/);
	});

	it('uses MutationObserver under the hood', () => {
		const _MutationObserver = MutationObserver;
		const observerSpy = jest.fn();

		window.MutationObserver = class extends MutationObserver {
			constructor(cb: MutationCallback) {
				super(cb);
				observerSpy();
			}
		};

		const handler = createHandler({ field: '' });

		dataParam()(handler, 'field');
		handler.init();

		window.MutationObserver = _MutationObserver;

		expect(observerSpy).toHaveBeenCalledTimes(1);
	});

	it('observes instance element', () => {
		const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');
		const handler = createHandler({ field: '' });

		dataParam()(handler, 'field');
		handler.init();

		expect(observeSpy).toHaveBeenCalledTimes(1);
		expect(handler.$element).toBe(handler.$element);
	});

	it('set field value with initial connected dataset field value', () => {
		const handler = createHandler({ field: '' });
		const VAL = 'data';

		(handler.$element as HTMLElement).dataset.field = VAL;
		dataParam()(handler, 'field');
		handler.init();

		expect(handler.field).toBe(VAL);
	});

	it('updates field value accordingly connected dataset field value', async () => {
		const handler = createHandler({ field: '' });
		const VAL = 'data';

		(handler.$element as HTMLElement).dataset.field = '';
		dataParam()(handler, 'field');
		handler.init();

		(handler.$element as HTMLElement).dataset.field = VAL;

		await flushPromises();

		expect(handler.field).toBe(VAL);
	});

	it('works with specified dataset field key', async () => {
		const handler = createHandler({ field: '' });
		const DATASET_FIELD = 'datasetField';
		const VAL = 'data';

		(handler.$element as HTMLElement).dataset[DATASET_FIELD] = '';
		dataParam(DATASET_FIELD)(handler, 'field');
		handler.init();

		expect(handler.field).toBe('');

		(handler.$element as HTMLElement).dataset[DATASET_FIELD] = VAL;

		await flushPromises();

		expect(handler.field).toBe(VAL);
	});

	it("don't override when used on multiple properties", () => {
		const handler = createHandler({ field_1: '', field_2: '' });
		const DATASET_FIELD_1 = 'datasetField1';
		const DATASET_FIELD_2 = 'datasetField2';
		const DATASET_VAL_1 = 'val1';
		const DATASET_VAL_2 = 'val2';

		(handler.$element as HTMLElement).dataset[DATASET_FIELD_1] = DATASET_VAL_1;
		(handler.$element as HTMLElement).dataset[DATASET_FIELD_2] = DATASET_VAL_2;
		dataParam(DATASET_FIELD_1)(handler, 'field_1');
		dataParam(DATASET_FIELD_2)(handler, 'field_2');
		handler.init();

		expect(handler.field_1).toBe(DATASET_VAL_1);
		expect(handler.field_2).toBe(DATASET_VAL_2);
	});

	it("don't react on changes of other data fields", async () => {
		const handler = createHandler({ field: '' });
		const DATASET_FIELD_1 = 'datasetField1';
		const DATASET_FIELD_2 = 'datasetField2';
		const VAL = 'data';
		const field1Mock = jest.fn();

		(handler.$element as HTMLElement).dataset[DATASET_FIELD_1] = VAL;
		(handler.$element as HTMLElement).dataset[DATASET_FIELD_2] = '';
		dataParam(DATASET_FIELD_1)(handler, 'field');
		handler.init();

		expect(handler.field).toBe(VAL);

		(handler as WithDataParam).__dataParams![DATASET_FIELD_1] = field1Mock;
		(handler.$element as HTMLElement).dataset[DATASET_FIELD_2] = '';

		await flushPromises();

		expect(field1Mock).not.toHaveBeenCalled();
	});

	it('disconnects observer on destroy', () => {
		const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
		const handler = createHandler({ field: '' });

		dataParam()(handler, 'field');
		handler.init();
		handler.destroy();

		expect(disconnectSpy).toHaveBeenCalledTimes(1);
	});
});
