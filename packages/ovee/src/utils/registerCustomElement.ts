// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (component: CustomElementConstructor, name: string, extendsEl?: string): void {
    if (window.customElements) {
        window.customElements.define(name, component);
        // window.customElements.define(name, component, { extends: extendsEl });
    }
}
