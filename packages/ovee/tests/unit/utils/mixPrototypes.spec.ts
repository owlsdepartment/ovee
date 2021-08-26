/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
import mixPrototypes from 'src/utils/mixPrototypes';

describe('mixPrototypes function', () => {
	function classesFactory() {
		return [
			class {
				constructor() {}

				method1() {}

				method2() {}

				method3() {}
			},
			class {
				constructor() {
					Object.defineProperty(this, 'prop1', {
						value: 'prop1Value',
						writable: true
					});
				}

				method1() {}

				method4() {}
			}
		] as const;
	}

	it('should copy all source methods into target', () => {
		const [Target, Source] = classesFactory();
		const originalTargetMethod2 = Target.prototype.method2;
		const originalTargetMethod3 = Target.prototype.method3;

		mixPrototypes(Target, Source);

		const ExtendedTarget = Target as typeof Target & typeof Source;

		expect(ExtendedTarget.prototype.constructor).toBe(Source.prototype.constructor);
		expect(ExtendedTarget.prototype.method1).toStrictEqual(Source.prototype.method1);
		expect(ExtendedTarget.prototype.method2).toStrictEqual(originalTargetMethod2);
		expect(ExtendedTarget.prototype.method3).toStrictEqual(originalTargetMethod3);
		expect(ExtendedTarget.prototype.method4).toStrictEqual(Source.prototype.method4);
	});

	it('should report to console.error when trying to override protected method', () => {
		const originalConsoleError = console.error;
		console.error = jest.fn();

		const [Target, Source] = classesFactory();

		mixPrototypes(Target, Source, ['method1']);

		const consoleError = console.error as jest.Mock;

		expect(consoleError.mock.calls.length).toBe(1);
		expect(consoleError.mock.calls[0][0]).toEqual(
			'Class tried to override protected instance method method1'
		);
		expect(consoleError.mock.calls[0][1]).toEqual(Source);

		console.error = originalConsoleError;
	});

	it('should report to silently ommit override of constructor when set as protected', () => {
		const originalConsoleError = console.error;
		console.error = jest.fn();

		const [Target, Source] = classesFactory();
		const originalTargetConstructor = Target.prototype.constructor;

		mixPrototypes(Target, Source, ['constructor']);

		const consoleError = console.error as jest.Mock;

		expect(consoleError.mock.calls.length).toBe(0);
		expect(Target.prototype.constructor).toStrictEqual(originalTargetConstructor);

		console.error = originalConsoleError;
	});

	it('should copy all source properties into target including those defined in constructor', () => {
		const [Target, Source] = classesFactory();

		mixPrototypes(Target, Source);

		const sourceProp1Desc = Object.getOwnPropertyDescriptor(new Source(), 'prop1');
		const targetProp1Desc = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');

		// eslint-disable-next-line no-prototype-builtins
		expect(Target.prototype.hasOwnProperty('prop1')).not.toBeUndefined();
		expect(targetProp1Desc).toEqual(sourceProp1Desc);
	});
});
