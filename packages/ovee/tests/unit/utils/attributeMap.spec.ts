import { describe, expect, it } from 'vitest';

import { attributeMaps } from '@/utils';

describe('attributeMap', () => {
	describe('number:map', () => {
		it('returns proper number values from the get method', () => {
			const { number } = attributeMaps;

			expect(number.get('')).toBeNaN();
			expect(number.get('20s')).toBeNaN();
			expect(number.get('0')).toBe(0);
			expect(number.get('1000')).toBe(1000);
			expect(number.get('-420')).toBe(-420);
		});

		it('returns proper string values from the set method', () => {
			const { number } = attributeMaps;

			expect(number.set(0)).toBe('0');
			expect(number.set(69)).toBe('69');
			expect(number.set(-21)).toBe('-21');
			expect(number.set(NaN)).toBe('');
			expect(number.set(null as any)).toBe('');
		});
	});

	describe('boolean:map', () => {
		it('returns proper boolean values from the get method', () => {
			const { boolean } = attributeMaps;

			expect(boolean.get('')).toBe(true);
			expect(boolean.get('text')).toBe(true);
			expect(boolean.get('true')).toBe(true);
			expect(boolean.get('false')).toBe(false);
			expect(boolean.get(null)).toBe(false);
			expect(boolean.get(undefined)).toBe(false);
		});

		it('returns proper string values from the set method', () => {
			const { boolean } = attributeMaps;

			expect(boolean.set(true)).toBe('');
			expect(boolean.set(false)).toBe(null);
		});
	});
});
