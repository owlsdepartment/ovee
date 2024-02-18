import { ReactiveEffect } from '@vue/reactivity';
import { queuePostFlushCb } from '@vue/runtime-core';

import { onBeforeMount } from '@/composables';
import { NOOP, NOOP_PROMISE } from '@/constants';
import { ComponentInstance, injectComponentContext } from '@/core';
import { executeWithTemplateContext } from '@/core/component/templateContext';
import { Logger } from '@/errors';
import { Fiber, JSXElement, Renderer } from '@/jsx';
import { getNoContextWarning, Task } from '@/utils';

export type TemplateFunction = () => JSXElement;
export type RequestUpdate = () => Promise<void>;

interface StoredRenderer {
	renderer: Renderer;
	templates: TemplateFunction[];
	requestUpdate: RequestUpdate;
}

const logger = new Logger('useTemplate');
const storedRendererMap = new Map<ComponentInstance, StoredRenderer>();

export function useTemplate(template: TemplateFunction): { requestUpdate: RequestUpdate } {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useTemplate'));

		return { requestUpdate: NOOP_PROMISE };
	}

	let stored = storedRendererMap.get(instance);

	if (!stored) {
		stored = {
			renderer: new Renderer(),
			templates: [],
			requestUpdate: NOOP_PROMISE,
		};
		stored.requestUpdate = useRenderSavedTemplate(instance, stored);
		storedRendererMap.set(instance, stored);
	}

	stored.templates.push(template);

	return {
		requestUpdate: stored.requestUpdate,
	};
}

function useRenderSavedTemplate(instance: ComponentInstance, stored: StoredRenderer) {
	const getFiber = () => <Fiber>stored!.templates[stored!.templates.length - 1]();

	const fiberEffect = new ReactiveEffect(
		() => {
			const fiber = getFiber();

			executeWithTemplateContext({ app: instance.app }, () => {
				stored.renderer.process(fiber, instance.element);
			});
		},
		NOOP,
		() => queuePostFlushCb(update)
	);
	const update = (force?: boolean) => {
		if (fiberEffect.dirty || force) {
			fiberEffect.run();
			queueRender();
		}
	};

	let renderTask: Task | null = null;
	function queueRender() {
		if (renderTask) return;

		renderTask = new Task();
		queuePostFlushCb(render);
	}
	function render() {
		stored.renderer.render();

		renderTask?.resolve();
		renderTask = null;
	}

	let updateTask: Task | null = null;
	async function requestUpdate(): Promise<void> {
		if (updateTask) return updateTask;

		updateTask = new Task();
		update(true);
		renderTask?.then(() => {
			updateTask?.resolve();
		});
	}

	onBeforeMount(() => {
		update();

		if (renderTask) instance.renderPromise = renderTask;
	});

	return requestUpdate;
}
