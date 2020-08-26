import dataParam from 'src/decorators/dataParam';
import createDecoratorsHandler from 'tests/helpers/createDecoratorsHandler';

const createHandler = <T extends object>(obj: T) => (
    createDecoratorsHandler(obj, { $element: document.createElement('div') })
);

describe('@prop decorator', () => {
    const consoleSpy = spyConsole('error');

    it('logs error when applied on field other than class property', () => {
        const handler = createHandler({ method() {} });

        dataParam()(handler, 'method');
        handler.init();

        expect(consoleSpy.console).toHaveBeenCalledTimes(1);
        expect(consoleSpy.console.mock.calls[0][0]).toBe('DataParam decorator should be only applied to a property');
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

    it('disconnects observer on destroy', () => {
        const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
        const handler = createHandler({ field: '' });

        dataParam()(handler, 'field');
        handler.init();
        handler.destroy();

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
});
