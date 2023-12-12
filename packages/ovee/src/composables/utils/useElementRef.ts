import { useQuerySelector, useQuerySelectorAll } from '@/composables';
import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning, OveeReadonlyRef } from '@/utils';

export type ElementRef<E = HTMLElement | null> = OveeReadonlyRef<E>;

const logger = new Logger('useElementRef');
const loggerMultiple = new Logger('useElementRefs');

export function useElementRef<E extends HTMLElement = HTMLElement>(
	name: string
): ElementRef<E | null> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useElementRef'));

		return { value: null };
	}

	return useQuerySelector(`[ref="${name}"]`);
}

export function useElementRefs<E extends HTMLElement = HTMLElement>(name: string): ElementRef<E[]> {
	const instance = injectComponentContext(true);

	if (!instance) {
		loggerMultiple.warn(getNoContextWarning('useElementRefs'));

		return { value: [] };
	}

	return useQuerySelectorAll(`[ref="${name}"]`);
}
