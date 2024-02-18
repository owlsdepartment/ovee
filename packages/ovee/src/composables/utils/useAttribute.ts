import { ref } from '@vue/reactivity';

import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import {
	attachAttributeObserver,
	AttributeMap,
	attributeMaps,
	AttributeMapType,
	getNoContextWarning,
	isNil,
	OveeRef,
} from '@/utils';

import { onMounted, onUnmounted } from '../hooks';

const logger = new Logger('useAttribute');

// TODO: use attribute map from JSX to suggest element attributes

export function useAttribute(key: string): OveeRef<string | null>;
export function useAttribute<Type>(key: string, map: AttributeMap<Type>): OveeRef<Type>;
export function useAttribute<MapType extends AttributeMapType>(
	key: string,
	map: MapType
): OveeRef<MapType extends 'number' ? number : boolean>;

export function useAttribute(key: string, _map?: AttributeMap | AttributeMapType): OveeRef<any> {
	const instance = injectComponentContext(true);
	const cachedValue = ref();
	const map = typeof _map === 'string' ? attributeMaps[_map] : _map;

	// TODO: log warning that there is no map

	if (!instance) {
		logger.warn(getNoContextWarning('useAttribute'));

		return { value: null };
	}

	const attributeRef: OveeRef<string | null> = {
		get value() {
			updateAttributeValue();

			return cachedValue.value;
		},

		set value(v: string | null) {
			const value = map ? map.set(v) : v;

			if (isNil(value)) {
				instance.element.removeAttribute(key);
			} else {
				instance.element.setAttribute(key, value);
			}
		},
	};

	const { observe, disconnect } = attachAttributeObserver(key, () => {
		updateAttributeValue();
	});

	onMounted(() => {
		observe(instance.element);
	});

	onUnmounted(() => {
		disconnect();
	});

	updateAttributeValue();

	function updateAttributeValue() {
		const value = instance!.element.getAttribute(key);

		cachedValue.value = map ? map.get(value) : value;
	}

	return attributeRef;
}
