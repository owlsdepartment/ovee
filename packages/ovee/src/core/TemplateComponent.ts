import { html, render, TemplateResult } from 'lit-html';
import { doWatchEffect, ref } from 'src/reactive';
import { Task } from 'src/utils';

import App from './App';
import Component, { ComponentOptions } from './Component';
import * as protectedFields from './protectedFields';

export default class TemplateComponent extends Component {
	readonly html!: typeof html;

	[protectedFields.UPDATE_TASK]: Task<void> | null = null;
	protected __clearRenderTarget = false;

	private $stopWatch = () => {};
	private $updateMarker = ref(false);
	private $compiledTemplate: TemplateResult | string = '';
	private $firstRender = true;

	protected get renderTarget(): HTMLElement {
		return this.$element;
	}

	constructor(element: HTMLElement, app: App, options?: ComponentOptions) {
		super(element, app, options);

		Object.defineProperty(this, 'html', {
			value: html,
			writable: false,
			configurable: false,
		});
	}

	private get $updateTask() {
		return this[protectedFields.UPDATE_TASK];
	}

	[protectedFields.BEFORE_INIT](): void {
		super[protectedFields.BEFORE_INIT]();

		this.$stopWatch = doWatchEffect(
			() => {
				this.$markRefrashable();
				this.$compiledTemplate = this.template();
				this.$doUpdate();
			},
			{ flush: 'sync' }
		);
	}

	$destroy() {
		this.$stopWatch();

		super.$destroy();
	}

	private $markRefrashable() {
		this.$updateMarker.value;
	}

	private $forceRefresh() {
		this.$updateMarker.value = !this.$updateMarker.value;
	}

	private $doUpdate(): void {
		if (this.$updateTask) {
			return;
		}

		this[protectedFields.UPDATE_TASK] = new Task();

		requestAnimationFrame(() => {
			this[protectedFields.RENDER]();
			this.$updateTask?.resolve();
			this[protectedFields.UPDATE_TASK] = null;
		});
	}

	[protectedFields.RENDER](): void {
		if (this.$firstRender) {
			this.$firstRender = false;

			if (this.__clearRenderTarget) this.renderTarget.innerHTML = '';
		}

		render(this.$compiledTemplate, this.renderTarget, {
			host: this,
		});
	}

	$requestUpdate(): Promise<void> {
		if (this.$updateTask && !this.$updateTask.finished) {
			return this.$updateTask;
		}

		this.$forceRefresh();

		return this.$updateTask ?? Promise.resolve();
	}

	template(): TemplateResult | string {
		return this.html``;
	}
}
