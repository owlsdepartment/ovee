import { computed, Ref, ref } from '@vue/reactivity';

import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import {
	attachAttributeObserver,
	AttributeMap,
	attributeMaps,
	AttributeMapType,
	getNoContextWarning,
	GetTypeFromMapType,
	isNil,
	isString,
	ObjectNotationMapValues,
} from '@/utils';

import { onMounted, onUnmounted } from '../hooks';

const logger = new Logger('useAttribute');

// TODO: use attribute map from JSX to suggest element attributes

export function useAttribute<Keys extends Record<string, ObjectNotationMapValues>>(
	keys: Keys
): {
	[Key in keyof Keys]: Ref<
		Keys[Key] extends AttributeMap
			? ReturnType<Keys[Key]['get']>
			: Keys[Key] extends AttributeMapType
			? GetTypeFromMapType<Keys[Key]>
			: string | null
	>;
};

export function useAttribute<Keys extends string[]>(
	keys: [...Keys]
): { [Key in keyof Keys]: Ref<string | null> };

export function useAttribute(key: string): Ref<string | null>;

export function useAttribute<Type>(key: string, map: AttributeMap<Type>): Ref<Type>;
export function useAttribute<MapType extends AttributeMapType>(
	key: string,
	map: MapType
): Ref<GetTypeFromMapType<MapType>>;

export function useAttribute(
	key: string | string[] | Record<string, ObjectNotationMapValues>,
	_map?: AttributeMap | AttributeMapType
): Ref<any> | Ref<any>[] | Record<string, Ref<any>> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useAttribute'));

		return ref(null);
	}

	if (Array.isArray(key)) {
		return (key as string[]).map(k => useAttribute(k));
	}

	if (!isString(key)) {
		return Object.entries(key).reduce((acc, [key, value]) => {
			if (value) {
				acc[key] = useAttribute(key, value as any);
			} else {
				acc[key] = useAttribute(key);
			}

			return acc;
		}, {} as Record<string, any>);
	}

	// TODO: log warning that there is no map
	const map = typeof _map === 'string' ? attributeMaps[_map] : _map;
	const cachedValue = ref();
	const attributeRef = computed<string | null>({
		get() {
			updateAttributeValue();

			return cachedValue.value;
		},

		set(v) {
			const value = map ? map.set(v) : v;

			if (isNil(value)) {
				instance.element.removeAttribute(key);
			} else {
				instance.element.setAttribute(key, value);
			}
		},
	});

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
		const value = instance!.element.getAttribute(key as string);

		cachedValue.value = map ? map.get(value) : value;
	}

	return attributeRef;
}
