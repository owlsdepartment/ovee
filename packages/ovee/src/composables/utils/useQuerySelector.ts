import { computed, ComputedRef, MaybeRefOrGetter, Ref, ref, toRef } from '@vue/reactivity';
import { watch } from '@vue/runtime-core';

import { ComponentInstance, injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning, MutationObserverManager, nil } from '@/utils';

import { onMounted, onUnmounted } from '../hooks';

const logger = new Logger('useQuerySelector');
const loggerAll = new Logger('useQuerySelectorAll');
const observerOptions: MutationObserverInit = { subtree: true, childList: true };

/**
 * Add potentialy dynamic target as a 2nd argument
 *
 * when passed, query is resolved around it and connects/disconnects, when ref changes
 * it uses seperate mutation observer that is created/destroyed accordingly
 */

/**
 * Reactively get child element that matches a given selector
 * @param selector element's selector
 * @param root dynamic root relative to which, the query is resolved
 * @returns reactive ref with found element
 */
export function useQuerySelector<El extends HTMLElement = HTMLElement>(
	selector: string,
	root?: MaybeRefOrGetter<HTMLElement | nil>
): ComputedRef<El | null> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useQuerySelector'));

		return computed(() => null);
	}

	if (root) return useCustomRootQuerySelector<El>(selector, root);

	return useQuerySelectorManager(instance, selector);
}

/**
 * Reactively get all children elements that matches a given selector
 * @param selector children selector
 * @param root dynamic root relative to which, the query is resolved
 * @returns reactive ref with found elements
 */
export function useQuerySelectorAll<El extends HTMLElement = HTMLElement>(
	selector: string,
	root?: MaybeRefOrGetter<HTMLElement | nil>
): ComputedRef<El[]> {
	const instance = injectComponentContext(true);

	if (!instance) {
		loggerAll.warn(getNoContextWarning('useQuerySelector'));

		return computed(() => []);
	}

	if (root) return useCustomRootQuerySelector<El>(selector, root, true);

	return useQuerySelectorManager(instance, selector, true);
}

function useCustomRootQuerySelector<El extends HTMLElement = HTMLElement>(
	selector: string,
	root: MaybeRefOrGetter<HTMLElement | nil>
): ComputedRef<El | null>;
function useCustomRootQuerySelector<El extends HTMLElement = HTMLElement>(
	selector: string,
	root: MaybeRefOrGetter<HTMLElement | nil>,
	all: true
): ComputedRef<El[]>;
function useCustomRootQuerySelector<El extends HTMLElement = HTMLElement>(
	selector: string,
	root: MaybeRefOrGetter<HTMLElement | nil>,
	all?: boolean
): ComputedRef<El[] | El | null> {
	const rootRef = toRef(root);
	const storedQuery: Ref<El[] | El | null> = ref(all ? [] : null);
	const getValue = all
		? (): El[] => Array.from(rootRef.value?.querySelectorAll(selector) ?? [])
		: (): El | null => rootRef.value?.querySelector(selector) ?? null;
	const observer = new MutationObserver(() => {
		storedQuery.value = getValue();
	});

	watch(
		rootRef,
		(curr, prev) => {
			if (prev) observer.disconnect();
			if (curr) observer.observe(curr, observerOptions);
		},
		{ immediate: true }
	);

	return computed(() => storedQuery.value);
}

function useQuerySelectorManager<El extends HTMLElement = HTMLElement>(
	instance: ComponentInstance,
	selector: string
): ComputedRef<El | null>;
function useQuerySelectorManager<El extends HTMLElement = HTMLElement>(
	instance: ComponentInstance,
	selector: string,
	all: true
): ComputedRef<El[]>;
function useQuerySelectorManager<El extends HTMLElement = HTMLElement>(
	instance: ComponentInstance,
	selector: string,
	all?: boolean
): ComputedRef<El[] | El | null> {
	const root = instance.element;
	const storedQuery: Ref<El[] | El | null> = ref(all ? [] : null);
	const getValue = all
		? (): El[] => Array.from(root.querySelectorAll(selector))
		: (): El | null => root.querySelector(selector);
	const updateValue = () => {
		storedQuery.value = getValue();
	};
	const manager = QuerySelectorManager.getInstance(instance);

	manager.register(updateValue);
	updateValue();

	onMounted(() => {
		manager.connect();
	});

	onUnmounted(() => {
		manager.disconnect();
	});

	return computed(() => storedQuery.value);
}

const queryManagersMap = new Map<ComponentInstance, QuerySelectorManager>();

class QuerySelectorManager extends MutationObserverManager {
	connected = false;
	observer: MutationObserver;
	callbacks: Array<() => void> = [];
	observeOptions = observerOptions;

	private constructor(element: HTMLElement) {
		super(element);

		this.observer = new MutationObserver(() => {
			this.callbacks.forEach(c => c());
		});

		this.connect();
	}

	register(callback: () => void) {
		this.callbacks.push(callback);
	}

	static getInstance(instance: ComponentInstance) {
		let manager = queryManagersMap.get(instance);

		if (!manager) {
			manager = new QuerySelectorManager(instance.element);
			queryManagersMap.set(instance, manager);
		}

		return manager;
	}
}
