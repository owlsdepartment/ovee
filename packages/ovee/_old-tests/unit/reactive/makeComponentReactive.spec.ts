/* eslint-disable max-classes-per-file */
import * as protectedFields from 'src/core/protectedFields';
import { WithReactiveProxy } from 'src/core/types';
import { ReactiveProxy } from 'src/reactive';
import { makeComponentReactive } from 'src/reactive/makeComponentReactive';

jest.mock('src/reactive/ReactiveProxy');

describe('makeComponentReactive function', () => {
	beforeEach(() => {
		(ReactiveProxy as jest.Mock).mockReset();
	});

	it('should return a new ReactiveProxy instance', () => {
		const result = makeComponentReactive({});

		expect(result).toBeInstanceOf(ReactiveProxy);
		expect(ReactiveProxy).toHaveBeenCalledTimes(1);
	});

	it('should return an existing ReactiveProxy instance if called twice on the same instance', () => {
		const instance = {};
		const result1 = makeComponentReactive(instance);
		const result2 = makeComponentReactive(instance);

		expect(result1).toStrictEqual(result2);
		expect(ReactiveProxy).toHaveBeenCalledTimes(1);
	});

	it('should attach ReactiveProxy instance to given instance', () => {
		const instance: WithReactiveProxy = {};

		makeComponentReactive(instance);

		expect(instance[protectedFields.REACTIVE_PROXY]).toBeInstanceOf(ReactiveProxy);
	});
});
