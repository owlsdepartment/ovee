import { describe, expect, it } from 'vitest';

import { isValidNode } from '@/utils';

describe('isValidNode function', () => {
	it('should reject script', () => {
		const tag = document.createElement('script');

		expect(isValidNode(tag)).toBeFalsy();
	});

	it('should reject svg', () => {
		const tag = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

		expect(isValidNode(tag)).toBeFalsy();
	});

	it('should accept div', () => {
		const tag = document.createElement('div');

		expect(isValidNode(tag)).toBeTruthy();
	});
});
