import { isString } from 'src/utils';

describe('isString helper', () => {
	it('should identify string literal as string', () => {
		expect(isString('')).toBe(true);
	});

	it('should identify String class instance as string', () => {
		expect(isString(new String())).toBe(true);
	});

	it('should not identify rest of possible data as string', () => {
		const nonStringValues = [null, undefined, {}, [], 0, class {}, () => {}];

		nonStringValues.forEach(v => {
			expect(isString(v)).toBe(false);
		});
	});
});
