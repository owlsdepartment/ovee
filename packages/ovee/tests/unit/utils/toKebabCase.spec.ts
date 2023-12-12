import { describe, expect, it } from 'vitest';

import { toKebabCase } from '@/utils';

describe('toKebabCase function', () => {
	it('should replace whitespace with dash', () => {
		expect(toKebabCase(' ')).toMatch('-');
	});

	it('should convert uppercase to lowercase', () => {
		expect(toKebabCase('ABC')).toMatch('abc');
	});

	it('should convert camelCase to kebab-case', () => {
		expect(toKebabCase('camelCase')).toMatch('camel-case');
	});

	it('should keep kebab case as a kebab case', () => {
		expect(toKebabCase('kebab-case')).toMatch('kebab-case');
		expect(toKebabCase('kebab-case-1')).toMatch('kebab-case-1');
	});
});
