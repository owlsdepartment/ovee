import { beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest';

import { registerCustomElement } from '@/utils';

describe('registerCustomElement', () => {
	let defineSpy: SpyInstance;

	beforeEach(() => {
		window.close = () => {};
		defineSpy = vi.spyOn(customElements, 'define');
	});

	it('should register customElement if api is available', () => {
		const htmlElement = class extends HTMLElement {};
		const tagName = 'test-element';

		registerCustomElement(htmlElement, tagName);

		expect(defineSpy).toBeCalledTimes(1);
		expect(defineSpy).toHaveBeenNthCalledWith(1, tagName, htmlElement);
	});

	it('should not throw any error if customElement api is not available', () => {
		const htmlElement = class extends HTMLElement {};
		const tagName = 'test-element';

		Object.defineProperty(window, 'customElements', {
			value: undefined,
		});

		expect(() => {
			registerCustomElement(htmlElement, tagName);
		}).not.toThrow();
	});
});
