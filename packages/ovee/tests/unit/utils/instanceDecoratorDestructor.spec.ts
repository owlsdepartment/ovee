import * as protectedFields from 'src/core/protectedFields';
import instanceDecoratorDestructor from 'src/utils/instanceDecoratorDestructor';

describe('instanceDecoratorDestructor function', () => {
    const originalConsoleError = console.error;

    beforeEach(() => {
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('should repoert error to console if second parameter is not a function', () => {
        instanceDecoratorDestructor('foo' as any, 'bar' as any);

        const err = console.error as jest.Mock;

        expect(err.mock.calls.length).toBe(1);
        expect(err.mock.calls[0][0]).toEqual('callback passed to instanceDecoratorDestructor should be a function');
    });

    it('should create an ampty array for destructors if it does not exist', () => {
        class Test {}

        instanceDecoratorDestructor(Test.prototype, jest.fn());

        expect(
            Array.isArray((Test.prototype.constructor as any)[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS])
        ).toBeTruthy();
    });

    it('should push callback into instanceDecoratorDestructors array', () => {
        class T {}
        const callback = jest.fn();

        instanceDecoratorDestructor(T.prototype, callback);
        const ctor = T.prototype.constructor as any;

        expect(ctor[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS].length).toBe(1);
        expect(ctor[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS][0]).toBe(callback);
    });
});
