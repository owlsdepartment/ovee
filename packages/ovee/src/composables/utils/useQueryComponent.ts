import { computed, ComputedRef } from '@vue/reactivity';
import { watch } from '@vue/runtime-core';

import { AnyComponent, Component, GetComponentInstance, HTMLOveeElement, useApp } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning, isDefined, isString, OveeReadonlyRef, toKebabCase } from '@/utils';
import { extractComponent } from '@/utils/extractComponent';
import { extractComponentInternalInstance } from '@/utils/extractComponentInternalInstance';

import { useQuerySelector, useQuerySelectorAll } from './useQuerySelector';

const logger = new Logger('useQueryComponent');
const loggerAll = new Logger('useQueryComponentAll');

/**
 * Find component's instance
 * When used with a target, returns one time instance
 * @param component component's name or a component definition
 * @param target optional target, from which component is searched. If used, returned instance is not reactive
 * @returns reactive ref with components instance
 */
export function useQueryComponent<C extends Component = AnyComponent>(
	component: C | string,
	target?: ParentNode
): OveeReadonlyRef<GetComponentInstance<C> | undefined> {
	const app = useApp(true);

	if (!app) {
		logger.warn(getNoContextWarning('useQueryComponent'));

		return { value: undefined };
	}

	let componentName: string;

	if (!isString(component)) {
		const storedComponent = Array.from(app.componentsManager.storedComponents.values()).find(sc => {
			return sc.component === component;
		});

		if (!storedComponent) return warnAboutNotExistingComponent(logger, undefined);

		componentName = storedComponent.name;
	} else {
		componentName = toKebabCase(component);

		const isComponentRegistered = Array.from(
			app.componentsManager.storedComponents.keys()
		).includes(componentName);

		if (!isComponentRegistered) return warnAboutNotExistingComponent(logger, undefined);
	}
	const selector = `${componentName}, [data-${componentName}]`;

	if (target) {
		const element = target.querySelector<HTMLOveeElement>(selector);

		return {
			value: element ? extractComponent(element, componentName) : undefined,
		};
	}

	const element = useQuerySelector<HTMLOveeElement>(selector);
	const internalInstance = computed(() =>
		element.value ? extractComponentInternalInstance(element.value, componentName) : undefined
	);
	const publicInstance: ComputedRef<GetComponentInstance<AnyComponent> | undefined> = computed(
		() => internalInstance.value?.instance
	);
	const instanceRef: OveeReadonlyRef<GetComponentInstance<AnyComponent> | undefined> = {
		get value() {
			return publicInstance.value;
		},
	};

	watch(
		internalInstance,
		(curr, prev) => {
			prev?.mountBus.off(onComponentUnmount);
			curr?.mountBus.on(onComponentUnmount);
		},
		{ immediate: true, flush: 'sync' }
	);

	function onComponentUnmount() {
		internalInstance.effect.scheduler?.();
	}

	return instanceRef;
}

/**
 * Find all component's instances
 * When used with a target, returns a one time non reactive instances
 * @param component component's name or a component definition
 * @param target optional target, from which components are searched. If used, returned instance is not reactive
 * @returns reactive ref with components instances
 */
export function useQueryComponentAll<C extends Component = AnyComponent>(
	component: C | string,
	target?: ParentNode
): OveeReadonlyRef<GetComponentInstance<C>[]> {
	const app = useApp(true);

	if (!app) {
		loggerAll.warn(getNoContextWarning('useQueryComponent'));

		return { value: [] };
	}

	let componentName: string;

	if (!isString(component)) {
		const storedComponent = Array.from(app.componentsManager.storedComponents.values()).find(sc => {
			return sc.component === component;
		});

		if (!storedComponent) return warnAboutNotExistingComponent(loggerAll, []);

		componentName = storedComponent.name;
	} else {
		componentName = toKebabCase(component);

		const isComponentRegistered = Array.from(
			app.componentsManager.storedComponents.keys()
		).includes(componentName);

		if (!isComponentRegistered) return warnAboutNotExistingComponent(loggerAll, []);
	}
	const selector = `${componentName}, [data-${componentName}]`;

	if (target) {
		const elements = Array.from(target.querySelectorAll<HTMLOveeElement>(selector));
		const instances = elements.map(e => extractComponent(e, componentName)).filter(isDefined);

		return {
			value: instances,
		};
	}

	const elements = useQuerySelectorAll<HTMLOveeElement>(selector);
	const internalInstances = computed(() =>
		elements.value.map(e => extractComponentInternalInstance(e, componentName)).filter(isDefined)
	);
	const publicInstance: ComputedRef<GetComponentInstance<AnyComponent> | undefined> = computed(() =>
		internalInstances.value.map(i => i.instance).filter(isDefined)
	);
	const instanceRef: OveeReadonlyRef<GetComponentInstance<AnyComponent> | undefined> = {
		get value() {
			return publicInstance.value;
		},
	};

	watch(
		internalInstances,
		(curr, prev) => {
			prev?.forEach(i => i.mountBus.off(onComponentUnmount));
			curr.forEach(i => i.mountBus.on(onComponentUnmount));
		},
		{ immediate: true, flush: 'sync' }
	);

	function onComponentUnmount() {
		internalInstances.effect.scheduler?.();
	}

	return instanceRef;
}

function warnAboutNotExistingComponent<D>(logger: Logger, defaultValue: D): OveeReadonlyRef<D> {
	logger.warn(
		'Component passed as any argument is not registered in the app yet. Consider registering it yourself, or pass a name that this component will have'
	);

	return { value: defaultValue };
}
