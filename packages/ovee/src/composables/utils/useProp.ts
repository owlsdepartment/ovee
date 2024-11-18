import { computed, Ref } from '@vue/reactivity';

import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { ClassConstructor, getNoContextWarning } from '@/utils';

const logger = new Logger('useProp');

export function useProp<El extends HTMLElement, Key extends keyof El>(
	propName: Key,
	base: ClassConstructor<El> | El
): Ref<El[Key]>;
export function useProp<Key extends keyof HTMLElement>(propName: Key): Ref<HTMLElement[Key]>;
export function useProp<R = any>(propName: string): Ref<R>;

export function useProp(propName: string): Ref<any> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useProp'));

		return { value: undefined } as any;
	}

	const propRef = computed<any>({
		get() {
			return Reflect.get(instance.element, propName);
		},

		set(v) {
			Reflect.set(instance.element, propName, v);
		},
	});

	return propRef;
}
