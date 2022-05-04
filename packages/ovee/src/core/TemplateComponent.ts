import { html, render, TemplateResult } from 'lit-html';
import { doWatchEffect, ref } from 'src/reactive';
import { Task } from 'src/utils';

import App from './App';
import Component, { ComponentOptions } from './Component';
import * as protectedFields from './protectedFields';

export default class TemplateComponent extends Component {
	readonly html!: typeof html;

	[protectedFields.UPDATE_TASK]: Task<void> | null = null;

	private $stopWatch = () => {};
	private $updateMarker = ref(false);
	private $compiledTemplate: TemplateResult | string = '';

	protected get renderTarget(): Element {
		return this.$element;
	}

	constructor(element: Element, app: App, options?: ComponentOptions) {
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
		render(this.$compiledTemplate, this.renderTarget, {
			eventContext: this as any,
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
