import { ref } from '@vue/reactivity';

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
	OveeRef,
	toKebabCase,
} from '@/utils';

import { onMounted, onUnmounted } from '../hooks';

const logger = new Logger('useDataAttr');

export function useDataAttr<Keys extends Record<string, ObjectNotationMapValues>>(
	keys: Keys
): {
	[Key in keyof Keys]: OveeRef<
		Keys[Key] extends AttributeMap
			? ReturnType<Keys[Key]['get']>
			: Keys[Key] extends AttributeMapType
			? GetTypeFromMapType<Keys[Key]>
			: string | null
	>;
};

export function useDataAttr<Keys extends string[]>(
	keys: [...Keys]
): { [Key in keyof Keys]: OveeRef<string | null> };

export function useDataAttr(key: string): OveeRef<string | undefined>;

export function useDataAttr<Type>(key: string, map: AttributeMap<Type>): OveeRef<Type>;
export function useDataAttr<MapType extends AttributeMapType>(
	key: string,
	map: MapType
): OveeRef<GetTypeFromMapType<MapType>>;

export function useDataAttr(
	key: string | string[] | Record<string, ObjectNotationMapValues>,
	_map?: AttributeMap | AttributeMapType
): OveeRef<any> | OveeRef<any>[] | Record<string, OveeRef<any>> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useDataAttr'));

		return { value: undefined };
	}

	if (Array.isArray(key)) {
		return (key as string[]).map(k => useDataAttr(k));
	}

	if (!isString(key)) {
		return Object.entries(key).reduce((acc, [key, value]) => {
			if (value) {
				acc[key] = useDataAttr(key, value as any);
			} else {
				acc[key] = useDataAttr(key);
			}

			return acc;
		}, {} as Record<string, any>);
	}

	const cachedValue = ref();
	const map = typeof _map === 'string' ? attributeMaps[_map] : _map;
	const domKey = `data-${toKebabCase(key)}`;

	const dataRef: OveeRef<string | undefined> = {
		get value() {
			updateDatasetValue();

			return cachedValue.value;
		},

		set value(v: string | undefined) {
			const dataValue = map ? map.set(v) : v;

			if (isNil(dataValue)) {
				delete instance.element.dataset[key];
			} else {
				instance.element.dataset[key] = dataValue;
			}
		},
	};

	const { observe, disconnect } = attachAttributeObserver(domKey, () => updateDatasetValue());

	onMounted(() => {
		observe(instance.element);
	});

	onUnmounted(() => {
		disconnect();
	});

	updateDatasetValue();

	function updateDatasetValue() {
		const dataValue = instance!.element.dataset[key as string];

		cachedValue.value = map ? map.get(dataValue) : dataValue;
	}

	return dataRef;
}
