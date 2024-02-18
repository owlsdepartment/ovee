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
	toKebabCase,
} from '@/utils';

import { onMounted, onUnmounted } from '../hooks';

const logger = new Logger('useDataAttr');

export function useDataAttr(key: string): OveeRef<string | undefined>;
export function useDataAttr<Type>(key: string, map: AttributeMap<Type>): OveeRef<Type>;
export function useDataAttr<MapType extends AttributeMapType>(
	key: string,
	map: MapType
): OveeRef<MapType extends 'number' ? number : boolean>;

export function useDataAttr(key: string, _map?: AttributeMap | AttributeMapType): OveeRef<any> {
	const instance = injectComponentContext(true);
	const cachedValue = ref();
	const map = typeof _map === 'string' ? attributeMaps[_map] : _map;
	const domKey = `data-${toKebabCase(key)}`;

	if (!instance) {
		logger.warn(getNoContextWarning('useDataAttr'));

		return { value: undefined };
	}

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
		const dataValue = instance!.element.dataset[key];

		cachedValue.value = map ? map.get(dataValue) : dataValue;
	}

	return dataRef;
}
