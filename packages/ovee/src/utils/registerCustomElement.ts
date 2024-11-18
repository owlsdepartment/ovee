export function registerCustomElement(component: CustomElementConstructor, name: string): void {
	if (window.customElements) {
		window.customElements.define(name, component);
	}
}
