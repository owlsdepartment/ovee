import watch from 'src/decorators/watch';
import ReactiveProxy from 'src/reactive/ReactiveProxy';
import makeReactive from 'src/reactive/makeReactive';
import createDecoratorsHandler from 'tests/helpers/createDecoratorsHandler';

jest.mock('src/reactive/makeReactive', () => ({
    __esModule: true,
    default: jest.fn((instance) => new ReactiveProxy(instance))
}));

describe('@watch decorator', () => {
    const spy = spyConsole('error');

    it('logs an error when not applied on a function', () => {
        const handler = createDecoratorsHandler({ field: '' });

        watch('a')(handler, 'field');
        handler.init();

        expect(spy.console).toHaveBeenCalledTimes(1);
        expect(spy.console.mock.calls[0][0]).toBe('Watch decorator should be only applied to a function');
    });

    it('requires path to be passed', () => {
        const handler = createDecoratorsHandler({ method: () => {} });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        watch()(handler, 'method');
        handler.init();

        expect(spy.console).toHaveBeenCalledTimes(1);
        expect(spy.console.mock.calls[0][0]).toBe('Path name must be provided for watch decorator');
    });

    it('calls makeReactive under the hood', () => {
        const handler = createDecoratorsHandler({
            a: '',
            method() {}
        });

        watch('a')(handler, 'method');
        handler.init();

        expect(makeReactive).toBeCalledTimes(1);
    });

    it('binds callback and watched property', () => {
        const watchSpy = jest.spyOn(ReactiveProxy.prototype, 'watch');
        const handler = createDecoratorsHandler({
            b: '',
            method() {}
        });

        watch('b')(handler, 'method');
        handler.init();

        expect(watchSpy).toBeCalledTimes(1);
        expect(watchSpy.mock.calls[0][0]).toBe('b');
        expect(watchSpy.mock.calls[0][1]).toBeInstanceOf(Function);
    });

    it('applies immediate check', () => {
        const stubFn = jest.fn();
        const handler = createDecoratorsHandler({
            a: '',
            method() {
                stubFn();
            }
        });

        watch('a', { immediate: true })(handler, 'method');
        handler.init();

        expect(stubFn).toBeCalledTimes(1);
    });

    it('destroyes ReactiveProxy when destructor is called', () => {
        const destroySpy = jest.spyOn(ReactiveProxy.prototype, 'destroy');
        const handler = createDecoratorsHandler({
            a: '',
            method() {}
        });

        watch('a', { immediate: true })(handler, 'method');
        handler.init();
        handler.destroy();

        expect(destroySpy).toBeCalledTimes(1);
    });
});
