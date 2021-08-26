/* eslint-disable max-classes-per-file */
import { WithReactiveProxy } from 'src/core/types';
import makeReactive from 'src/reactive/makeReactive';
import ReactiveProxy from 'src/reactive/ReactiveProxy';

jest.mock('../../../src/reactive/ReactiveProxy');

describe('makeReactive function', () => {
	beforeEach(() => {
		(ReactiveProxy as jest.Mock).mockReset();
	});

	it('should return a new ReactiveProxy instance', () => {
		const result = makeReactive({});

		expect(result).toBeInstanceOf(ReactiveProxy);
		expect(ReactiveProxy).toHaveBeenCalledTimes(1);
	});

	it('should return an existing ReactiveProxy instance if called twice on the same instance', () => {
		const instance = {};
		const result1 = makeReactive(instance);
		const result2 = makeReactive(instance);

		expect(result1).toStrictEqual(result2);
		expect(ReactiveProxy).toHaveBeenCalledTimes(1);
	});

	it('should attach ReactiveProxy instance to given instance', () => {
		const instance: WithReactiveProxy = {};

		makeReactive(instance);

		expect(instance.__reactiveProxy).toBeInstanceOf(ReactiveProxy);
	});
});
