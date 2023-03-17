import { JSDOM } from 'jsdom';
import { isValidNode } from 'src/utils/isValidNode';

const dom = new JSDOM('<!DOCTYPE html>');

describe('isValidNode function', () => {
	it('should reject script', () => {
		const tag = dom.window.document.createElement('script');

		expect(isValidNode(tag)).toBeFalsy();
	});

	it('should reject svg', () => {
		const tag = dom.window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');

		expect(isValidNode(tag)).toBeFalsy();
	});

	it('should accept div', () => {
		const tag = dom.window.document.createElement('div');

		expect(isValidNode(tag)).toBeTruthy();
	});
});
