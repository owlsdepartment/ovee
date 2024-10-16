import { isNil } from './typeChecking';

export type AttributeMapType = 'number' | 'boolean';
export type GetTypeFromMapType<T extends AttributeMapType> = T extends 'number' ? number : boolean;
export type ObjectNotationMapValues = AttributeMapType | AttributeMap | '' | null | undefined;
export interface AttributeMap<V = any> {
	get(v: string | null | undefined): V;
	set(v: V): string | null | undefined;
}

export const attributeMaps = {
	number: {
		get: param => (!param ? NaN : +param),
		set: value => (isNil(value) || isNaN(value) ? '' : `${value}`),
	} as AttributeMap<number>,

	boolean: {
		get: param => {
			if (isNil(param) || param.toLowerCase() === 'false') return false;

			return true;
		},
		set: value => {
			return value ? '' : null;
		},
	} as AttributeMap<boolean>,
} as const;
