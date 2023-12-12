import { effect, queuePostFlushCb } from '@vue/runtime-core';

import { onBeforeMount } from '@/composables';
import { NOOP_PROMISE } from '@/constants';
import { ComponentInternalContext, injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { createRenderer, RenderSync } from '@/jsx';
import { getNoContextWarning, Task } from '@/utils';

/**
 * TODO:
 * - saving/using slots
 */

export type TemplateFunction = () => any;
export type RequestUpdate = () => Promise<void>;

interface StoredRenderer {
	// render: Render;
	renderSync: RenderSync;
	templates: TemplateFunction[];
	requestUpdate: RequestUpdate;
}

const logger = new Logger('useTemplate');
const storedRendererMap = new Map<ComponentInternalContext, StoredRenderer>();

export function useTemplate(template: TemplateFunction): { requestUpdate: RequestUpdate } {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useTemplate'));

		return { requestUpdate: NOOP_PROMISE };
	}

	let stored = storedRendererMap.get(instance);

	if (!stored) {
		const { renderSync } = createRenderer();

		stored = {
			renderSync,
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

function useRenderSavedTemplate(instance: ComponentInternalContext, stored: StoredRenderer) {
	let fragment: any;
	const getFragment = () => stored!.templates[stored!.templates.length - 1]();
	const fragmentEffect = effect(
		() => {
			fragment = getFragment();
			queueRender();
		},
		{ lazy: true }
	);

	let renderTask: Task | null = null;
	const render = () => {
		if (!fragment) return;

		stored!.renderSync(fragment, instance.element);

		renderTask?.resolve();
		renderTask = null;
	};

	function queueRender() {
		if (renderTask) return;

		renderTask = new Task();
		queuePostFlushCb(render);
	}

	onBeforeMount(() => {
		fragmentEffect();

		// TODO: check this shit
		if (renderTask) instance.renderPromise = renderTask;
	});

	let updateTask: Task | null = null;

	async function requestUpdate(): Promise<void> {
		if (updateTask) return updateTask;

		updateTask = new Task();
		fragmentEffect();
		renderTask?.then(() => {
			updateTask?.resolve();
		});
	}

	return requestUpdate;
}
