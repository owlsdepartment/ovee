import { ComponentContext, injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import {
	attachMutationObserver,
	Dictionary,
	getNoContextWarning,
	isValidNode,
	MutationCallback,
} from '@/utils';

import { onMounted, onUnmounted } from './hooks';

export interface ElementRef<E = HTMLElement> {
	readonly value: E | null;
}

const logger = new Logger('useElementRef');
const managersInstanceMap = new Map<ComponentContext, RefsManager>();

export function useElementRef<E extends HTMLElement = HTMLElement>(
	name: string,
	multiple?: boolean
): ElementRef<E>;
export function useElementRef<E extends HTMLElement = HTMLElement>(
	name: string,
	multiple: true
): ElementRef<E[]>;

export function useElementRef<E extends HTMLElement = HTMLElement>(
	name: string,
	multiple = false
): ElementRef<E | E[]> {
	const instance = injectComponentContext(true);
	let refsManager: RefsManager | null = null;
	const ref: ElementRef<E | E[]> = {
		get value() {
			const refs = refsManager?.getRefs<E>(name) ?? [];

			return multiple ? [...refs] : refs[0] ?? null;
		},
	};

	if (!instance) {
		logger.warn(getNoContextWarning('useElementRefs'));

		return ref;
	}

	refsManager = RefsManager.getManager(instance);

	onMounted(() => {
		refsManager?.connect();
	});

	onUnmounted(() => {
		refsManager?.disconnect();
	});

	return ref;
}

class RefsManager {
	observer?: MutationObserver;
	observe?: () => void;
	refs: Dictionary<HTMLElement[] | undefined> = {};
	connected = false;

	constructor(public element: HTMLElement) {
		this.updateRefs();
		this.trackRefs();
	}

	getRefs<E>(name: string): E[] {
		return (this.refs[name] as E[] | undefined) ?? [];
	}

	disconnect() {
		if (!this.connected) return;

		this.observer?.disconnect();
		this.clearRefs();
		this.connected = false;
	}

	connect() {
		if (this.connected) return;

		this.observe?.();
		this.updateRefs();
		this.connected = true;
	}

	updateRefs(): void {
		const refsObj: Dictionary<HTMLElement[]> = {};

		this.element.querySelectorAll<HTMLElement>('[ref]').forEach(el => {
			const refKey = el.getAttribute('ref');

			if (!refKey) {
				return;
			}

			if (!refsObj[refKey]) {
				refsObj[refKey] = [];
			}

			refsObj[refKey].push(el);
		});

		this.refs = refsObj;
	}

	trackRefs(): void {
		const selector = '[ref]';
		const mutationHook: MutationCallback = affectedNodes => {
			const matches = Array.from(affectedNodes)
				.filter(isValidNode)
				.some(node => node.matches(selector) || node.querySelector(selector));

			if (matches) {
				this.updateRefs();
			}
		};

		const { observer, run } = attachMutationObserver(this.element, mutationHook, mutationHook);

		this.observer = observer;
		this.observe = run;
		this.connected = true;
	}

	clearRefs() {
		Object.keys(this.refs).forEach(key => {
			delete this.refs[key];
		});
	}

	static getManager(instance: ComponentContext) {
		const manager = managersInstanceMap.get(instance);

		if (!manager) {
			const manager = new RefsManager(instance.element);

			managersInstanceMap.set(instance, manager);

			return manager;
		}

		return manager;
	}
}
