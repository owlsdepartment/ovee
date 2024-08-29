import { computed, ComputedRef } from '@vue/reactivity';

import { useQuerySelector, useQuerySelectorAll } from '@/composables';
import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

export type ElementRef<E = HTMLElement | null> = ComputedRef<E>;

const logger = new Logger('useElementRef');
const loggerMultiple = new Logger('useElementRefs');

export function useElementRef<E extends HTMLElement = HTMLElement>(
	name: string
): ElementRef<E | null> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useElementRef'));

		return computed(() => null);
	}

	return useQuerySelector(`[ref="${name}"]`);
}

export function useElementRefs<E extends HTMLElement = HTMLElement>(name: string): ElementRef<E[]> {
	const instance = injectComponentContext(true);

	if (!instance) {
		loggerMultiple.warn(getNoContextWarning('useElementRefs'));

		return computed(() => []);
	}

	return useQuerySelectorAll(`[ref="${name}"]`);
}
