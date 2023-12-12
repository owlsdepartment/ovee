import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { ClassConstructor, getNoContextWarning, OveeRef } from '@/utils';

const logger = new Logger('useProp');

export function useProp<El extends HTMLElement, Key extends keyof El>(
	propName: Key,
	base: ClassConstructor<El> | El
): OveeRef<El[Key]>;
export function useProp<Key extends keyof HTMLElement>(propName: Key): OveeRef<HTMLElement[Key]>;
export function useProp<R = any>(propName: string): OveeRef<R>;

export function useProp(propName: string): OveeRef<any> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useProp'));

		return { value: undefined } as any;
	}

	const propRef: OveeRef<any> = {
		get value() {
			return Reflect.get(instance.element, propName);
		},

		set value(v) {
			Reflect.set(instance.element, propName, v);
		},
	};

	return propRef;
}
