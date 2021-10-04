export function registerCustomElement(
	component: CustomElementConstructor,
	name: string,
	extendsEl?: string
): void {
	if (window.customElements) {
		window.customElements.define(name, component, extendsEl ? { extends: extendsEl } : undefined);
	}
}
