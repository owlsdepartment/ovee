import { html, render, TemplateResult } from 'lit-html';

import watch from 'src/decorators/watch';

import App from './App';
import Component, { ComponentOptions } from './Component';
import * as protectedFields from './protectedFields';

export default class TemplateComponent extends Component {
    [protectedFields.UPDATE_AF]: number | null = null;
    [protectedFields.UPDATE_PROMISE]: Promise<void> | null = null;

    readonly html!: typeof html;

    constructor(element: Element, app: App, options?: ComponentOptions) {
        super(element, app, options);

        Object.defineProperty(this, 'html', {
            value: html,
            writable: false,
            configurable: false
        });
    }

    async [protectedFields.BEFORE_INIT](): Promise<void> {
        await super[protectedFields.BEFORE_INIT]();
        await this.$requestUpdate();
    }

    template(): TemplateResult | string {
        return this.html``;
    }

    @watch('*')
    $requestUpdate(): Promise<void> {
        if (!this[protectedFields.UPDATE_AF]) {
            this[protectedFields.UPDATE_PROMISE] = new Promise((resolve) => {
                this[protectedFields.UPDATE_AF] = requestAnimationFrame(() => {
                    this[protectedFields.UPDATE_AF] = null;
                    this[protectedFields.RENDER]();
                    resolve();
                });
            });
        }

        return this[protectedFields.UPDATE_PROMISE] ?? Promise.resolve();
    }

    [protectedFields.RENDER](): void {
        render(this.template(), this.$element, {
            eventContext: this as any
        });
    }
}
