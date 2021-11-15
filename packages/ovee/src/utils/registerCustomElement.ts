/* eslint-disable @typescript-eslint/no-unused-vars */
export function registerCustomElement(
	component: CustomElementConstructor,
	name: string,
	extendsEl?: string
): void {
	if (window.customElements) {
		window.customElements.define(name, component);
		// window.customElements.define(name, component, { extends: extendsEl });
	}
}
