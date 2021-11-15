import { registerCustomElement } from 'src/utils/registerCustomElement';

describe('registerCustomElement function', () => {
	beforeAll(() => {
		// Fix because of jsdom and the way, that he reapplies `customElements`
		window.close = () => {};
	});

	it('should register customElement if api is available', () => {
		const mockDefine = jest.fn();
		const htmlElement = class extends HTMLElement {};
		const tagName = 'test-element';

		Object.defineProperty(window, 'customElements', {
			value: { define: mockDefine },
		});
		registerCustomElement(htmlElement, tagName);

		expect(mockDefine.mock.calls.length).toBe(1);
		expect(mockDefine.mock.calls[0][0]).toBe(tagName);
		expect(mockDefine.mock.calls[0][1]).toBe(htmlElement);
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
