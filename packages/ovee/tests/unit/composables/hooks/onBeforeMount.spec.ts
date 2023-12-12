import { describe, expect, it, vi } from 'vitest';

import { onBeforeMount } from '@/composables/hooks';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('onBeforeMount');

describe('onBeforeMount', () => {
	const warnSpy = spyConsole('warn');

	it('registers callback, that runs after setup function', () => {
		const cb = vi.fn();
		const component = defineComponent(() => {
			onBeforeMount(cb);
		});
		createComponent(component, {}, false);

		expect(cb).toBeCalledTimes(1);
	});

	it('logs warning when used outside of a component', () => {
		onBeforeMount(() => {});

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});
});
