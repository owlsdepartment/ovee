import { describe, expect, it, vi } from 'vitest';

import { onUnmounted } from '@/composables/hooks';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('onUnmounted');

describe('onUnmounted', () => {
	const warnSpy = spyConsole('warn');

	it('registers callback, that runs when component is unmounted', () => {
		const cb = vi.fn();
		const component = defineComponent(() => {
			onUnmounted(cb);
		});
		const instance = createComponent(component, {});

		expect(cb).not.toBeCalled();

		instance.unmount();

		expect(cb).toBeCalledTimes(1);
	});

	it('logs warning when used outside of a component', () => {
		onUnmounted(() => {});

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});
});
