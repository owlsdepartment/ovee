import { Ref, ref } from '@vue/reactivity';

import { ComponentInternalContext, injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning, MutationObserverManager, OveeReadonlyRef } from '@/utils';

import { onMounted, onUnmounted } from '../hooks';

const logger = new Logger('useQuerySelector');
const loggerAll = new Logger('useQuerySelectorAll');

/**
 * Reactively get child element that matches a given selector
 * @param selector element's selector
 * @returns reactive ref with found element
 */
export function useQuerySelector<El extends HTMLElement = HTMLElement>(
	selector: string
): OveeReadonlyRef<El | null> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useQuerySelector'));

		return { value: null };
	}

	const storedQuery: Ref<El | null> = ref(null);
	const queryRef: OveeReadonlyRef<El | null> = {
		get value() {
			return storedQuery.value;
		},
	};

	useQuerySelectorManager(instance, () => {
		storedQuery.value = instance.element.querySelector<El>(selector);
	});

	return queryRef;
}

/**
 * Reactively get all children elements that matches a given selector
 * @argument selector children selector
 * @returns reactive ref with found elements
 */
export function useQuerySelectorAll<El extends HTMLElement = HTMLElement>(
	selector: string
): OveeReadonlyRef<El[]> {
	const instance = injectComponentContext(true);

	if (!instance) {
		loggerAll.warn(getNoContextWarning('useQuerySelector'));

		return { value: [] };
	}

	const storedQuery: Ref<El[]> = ref([]);
	const queryRef: OveeReadonlyRef<El[]> = {
		get value() {
			return [...storedQuery.value];
		},
	};

	useQuerySelectorManager(instance, () => {
		storedQuery.value = Array.from(instance.element.querySelectorAll<El>(selector));
	});

	return queryRef;
}

function useQuerySelectorManager(instance: ComponentInternalContext, updateValue: () => void) {
	const manager = QuerySelectorManager.getInstance(instance);

	manager.register(updateValue);
	updateValue();

	onMounted(() => {
		manager.connect();
	});

	onUnmounted(() => {
		manager.disconnect();
	});
}

const queryManagersMap = new Map<ComponentInternalContext, QuerySelectorManager>();

class QuerySelectorManager extends MutationObserverManager {
	connected = false;
	observer: MutationObserver;
	callbacks: Array<() => void> = [];
	observeOptions: MutationObserverInit = { childList: true, subtree: true };

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

	static getInstance(instance: ComponentInternalContext) {
		let manager = queryManagersMap.get(instance);

		if (!manager) {
			manager = new QuerySelectorManager(instance.element);
			queryManagersMap.set(instance, manager);
		}

		return manager;
	}
}
