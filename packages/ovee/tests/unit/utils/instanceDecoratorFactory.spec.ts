import * as protectedFields from 'src/core/protectedFields';
import instanceDecoratorFactory from 'src/utils/instanceDecoratorFactory';

describe('instanceDecoratorFactory function', () => {
    it('should produce a proper decorator structure', () => {
        const product = instanceDecoratorFactory(jest.fn());
        const decorator = product();

        expect(product).toBeInstanceOf(Function);
        expect(decorator).toBeInstanceOf(Function);
    });

    it('should create an ampty array for decorators if it does not exist', () => {
        const target = {};
        const product = instanceDecoratorFactory(jest.fn());
        const decorator = product();

        decorator(target, 'foo');

        expect(Array.isArray((target as any)[protectedFields.INSTANCE_DECORATORS])).toBeTruthy();
    });

    it('should push callback into instanceDecorators array', () => {
        const target = {
            [protectedFields.INSTANCE_DECORATORS]: []
        };
        const product = instanceDecoratorFactory(jest.fn());
        const decorator = product();

        decorator(target, 'foo');

        expect(target[protectedFields.INSTANCE_DECORATORS].length).toBe(1);
        expect(target[protectedFields.INSTANCE_DECORATORS][0]).toBeInstanceOf(Function);
    });

    it('should call callback with proper parameters', () => {
        const target = {
            [protectedFields.INSTANCE_DECORATORS]: []
        };
        const prop = 'foo';
        const dummyArg = 'bar';
        const instance = {};
        const callback = jest.fn();
        const product = instanceDecoratorFactory(callback);
        const decorator = product(dummyArg);

        decorator(target, prop);

        (target[protectedFields.INSTANCE_DECORATORS][0] as any)(instance);

        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toBe(instance);
        expect(callback.mock.calls[0][1]).toBe(prop);
        expect(callback.mock.calls[0][2]).toBe(dummyArg);
    });
});
