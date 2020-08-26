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
        const instance: any = {};

        instanceDecoratorDestructor(instance, jest.fn());

        expect(Array.isArray(instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS])).toBeTruthy();
    });

    it('should push callback into instanceDecoratorDestructors array', () => {
        const instance: any = {
            [protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]: []
        };
        const callback = jest.fn();

        instanceDecoratorDestructor(instance, callback);

        expect(instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS].length).toBe(1);
        expect(instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS][0]).toBe(callback);
    });
});
