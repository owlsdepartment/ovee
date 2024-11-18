import { describe, expect, it, vi } from 'vitest';

import { onMounted } from '@/composables/hooks';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('onMounted');

describe('onMounted', () => {
	const warnSpy = spyConsole('warn');

	it('registers callback, that runs when component is mounted', () => {
		const cb = vi.fn();
		const component = defineComponent(() => {
			onMounted(cb);
		});
		const instance = createComponent(component, {}, false);

		expect(cb).not.toBeCalled();

		instance.mount();

		expect(cb).toBeCalledTimes(1);
	});

	it('logs warning when used outside of a component', () => {
		onMounted(() => {});

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});
});
