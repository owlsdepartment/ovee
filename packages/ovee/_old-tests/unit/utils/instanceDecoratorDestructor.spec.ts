import { InstanceDecorators } from 'src/core/InstanceDecorators';
import * as protectedFields from 'src/core/protectedFields';
import { instanceDecoratorDestructor } from 'src/utils/instanceDecoratorDestructor';
import { createLoggerRegExp } from 'tests/helpers';

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
		expect(err.mock.calls[0][0]).toMatch(createLoggerRegExp('instanceDecoratorDestructor'));
	});

	it('should create an ampty array for destructors if it does not exist', () => {
		class Test extends InstanceDecorators {}

		const test = new Test();

		instanceDecoratorDestructor(test, jest.fn());

		expect(Array.isArray(test[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS])).toBeTruthy();
	});

	it('should push callback into instanceDecoratorDestructors array', () => {
		class T extends InstanceDecorators {}
		const callback = jest.fn();
		const test = new T();

		instanceDecoratorDestructor(test, callback);

		expect(test[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]?.length).toBe(1);
		expect(test[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]?.[0]).toBe(callback);
	});

	it('should only call destructor of currently destroyed instance', () => {
		class T extends InstanceDecorators {}

		const test1 = new T();
		const test2 = new T();
		const callback1 = jest.fn();
		const callback2 = jest.fn();

		instanceDecoratorDestructor(test1, callback1);
		instanceDecoratorDestructor(test2, callback2);

		test1[protectedFields.DESTROY_DECORATORS]();

		expect(callback1).toBeCalledTimes(1);
		expect(callback2).not.toBeCalled();
	});
});
