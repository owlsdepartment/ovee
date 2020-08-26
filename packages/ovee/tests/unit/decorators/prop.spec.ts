import prop from 'src/decorators/prop';
import ReactiveProxy from 'src/reactive/ReactiveProxy';
import createDecoratorsHandler from 'tests/helpers/createDecoratorsHandler';

jest.mock('src/reactive/makeReactive', () => ({
    __esModule: true,
    default: jest.fn((instance) => new ReactiveProxy(instance))
}));

// eslint-disable-next-line @typescript-eslint/ban-types
const createHandler = <T extends object>(obj: T) => (
    createDecoratorsHandler(obj, { $element: document.createElement('div') })
);

describe('@prop decorator', () => {
    const consoleSpy = spyConsole('error');

    it('logs error when applied on field other than class property', () => {
        const handler = createHandler({ method() {} });

        prop()(handler, 'method');
        handler.init();

        expect(consoleSpy.console).toHaveBeenCalledTimes(1);
        expect(consoleSpy.console.mock.calls[0][0]).toBe('Prop decorator should be only applied to a property');
    });

    it('copies element current value to instance field', () => {
        const handler = createHandler({ clientHeight: null });

        prop()(handler, 'clientHeight');
        handler.init();

        expect(handler.clientHeight).toBe(0);
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
