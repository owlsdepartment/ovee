import { toRaw } from '@vue/reactivity';

import { AnyFunction, AnyObject, ClassConstructor, Data, isFunction, PrimitiveName } from '@/utils';

// NOTE: prop type checking should be DEV MODE ONLY

export interface PropsDefinition {
	[key: string]: PropEntry;
}

export type PropsDefinitionToRawTypes<Props extends PropsDefinition> = {
	[Key in keyof Props as Props[Key] extends { required: true } ? never : Key]?: PropEntryToUnion<
		Props[Key]
	>;
} & {
	[Key in keyof Props as Props[Key] extends { required: true } ? Key : never]: PropEntryToUnion<
		Props[Key]
	>;
};

type PropEntryToUnion<Entry extends PropEntry> = PropTypeToUnion<
	Entry extends { type: PropType<unknown> } ? Entry['type'] : Entry
>;
type PropTypeToUnion<Prop extends PropType<unknown>> = Prop extends PropBase<unknown>
	? PropToType<Prop>
	: Prop extends any[]
	? PropToType<Prop[number]>
	: null;
type PropToType<P extends PropBase<unknown> | null> = P extends PropBase<unknown>
	? ReturnType<P>
	: null;

export type PropEntry<T = unknown> =
	| PropType<T>
	| {
			type: PropType<T>;
			default?: T | (() => T);
			required?: boolean;
	  };

export type PropType<T> = null | PropBase<T> | (null | PropBase<T>)[];

export interface NormalizedProp {
	type: PropBase<any>[];
	default?: () => any;
	required?: boolean;
	shouldCast: boolean;
	shouldCastTrue: boolean;
}

export interface NormalizedProps {
	[key: string]: NormalizedProp;
}

type PossibleTypes =
	| 'boolean'
	| 'symbol'
	| 'number'
	| 'string'
	| 'array'
	| 'object'
	| 'function'
	| 'any';

export interface PropBase<T> {
	(): T;
	get expected(): string;
	validate(v: unknown): boolean;
}

export function PropBoolean(): boolean {
	return undefined as any;
}
PropBoolean.expected = 'boolean';
PropBoolean.validate = (v: unknown): boolean => {
	return v === true || v === false;
};

export function PropSymbol<T extends symbol = symbol>(): T {
	return undefined as any;
}
PropSymbol.expected = 'symbol';
PropSymbol.validate = (v: unknown): boolean => {
	return typeof v === 'symbol';
};

export function PropNumber<T extends number = number>(): T {
	return undefined as any;
}
PropNumber.expected = 'number';
PropNumber.validate = (v: unknown): boolean => {
	return isType(v, 'number', Number);
};

export function PropString<T extends string = string>(): T {
	return undefined as any;
}
PropString.expected = 'string';
PropString.validate = (v: unknown): boolean => {
	return isType(v, 'string', String);
};

export function PropArray<T extends any[] = any[]>(): T {
	return undefined as any;
}
PropArray.expected = 'array';
PropArray.validate = (v: unknown): boolean => {
	return Array.isArray(v);
};

export function PropObject<T extends AnyObject = AnyObject>(): T {
	return undefined as any;
}
PropObject.expected = 'object';
PropObject.validate = (v: unknown): boolean => {
	return v != null && typeof v === 'object';
};

export function PropFunction<T extends AnyFunction = AnyFunction>(): T {
	return undefined as any;
}
PropFunction.expected = 'function';
PropFunction.validate = (v: unknown): boolean => {
	return typeof v === 'function';
};

export function PropNull(): null {
	return null;
}
PropNull.expected = 'null';
PropNull.validate = (v: unknown): boolean => {
	return v === null;
};

export function PropAny<T = any>(): T {
	return undefined as T;
}
PropAny.expected = 'any';
PropAny.validate = (): boolean => {
	return true;
};

export const Prop = {
	boolean: PropBoolean,
	string: PropString,
	symbol: PropSymbol,
	number: PropNumber,
	array: PropArray,
	object: PropObject,
	function: PropFunction,
	any: PropAny,
} as const satisfies Record<PossibleTypes, PropBase<any>>;

function isType(v: unknown, type: PrimitiveName, typeProto: ClassConstructor<any>): boolean {
	return typeof v === type || v instanceof typeProto;
}

export function normalizeProps(props: PropsDefinition): NormalizedProps {
	const normalizedProps: NormalizedProps = {};

	for (const key in props) {
		const opt = props[key];
		const prop = Array.isArray(opt) || isFunction(opt) || opt === null ? { type: opt } : opt;
		const type = (Array.isArray(prop.type) ? prop.type : [prop.type]).map(t =>
			t === null ? PropNull : t
		);
		const defaultFactory =
			opt != null && 'default' in opt
				? isFunction(opt.default) && !(type.length === 1 && type[0] === PropFunction)
					? (opt.default as () => any)
					: () => opt.default
				: undefined;
		const normalized: NormalizedProp = {
			...prop,
			type,
			default: defaultFactory,
			shouldCast: false,
			shouldCastTrue: true,
		};

		normalizedProps[key] = normalized;

		if (type.length > 1) {
			for (const t of type) {
				if (t === PropBoolean) {
					normalized.shouldCast = true;
					break;
				} else if (t === PropString) {
					// If we find `PropString` before `PropBoolean`, e.g. `[Prop.string, Prop.boolean]`,
					// we need to handle the casting slightly differently. Props
					// passed as `<Comp checked="">` or `<Comp checked="checked">`
					// will either be treated as strings or converted to a boolean
					// `true`, depending on the order of the types.
					normalized.shouldCastTrue = false;
				}
			}
		} else if (type[0] === PropBoolean) {
			normalized.shouldCast = true;
		}
	}

	return normalizedProps;
}

export function resolvePropsValues(
	rawProps: Data,
	props: Data,
	options: NormalizedProps,
	cachedDefaults: AnyObject
) {
	for (const [key, option] of Object.entries(options)) {
		if (!option) continue;

		props[key] = resolvePropValue(option, key, rawProps[key], key in rawProps, cachedDefaults);
		delete rawProps[key];
	}

	// TODO: if __DEV__
	validateProps(rawProps, props, options);

	return rawProps;
}

function resolvePropValue(
	option: NormalizedProp,
	key: string,
	value: unknown,
	isAbsent: boolean,
	cachedDefaults: AnyObject
): any {
	const defaultFactory = option.default;
	const hasDefault = !!defaultFactory;

	if (hasDefault && value === undefined) {
		if (key in cachedDefaults) {
			value = cachedDefaults[key];
		} else {
			value = cachedDefaults[key] = defaultFactory();
		}
	}

	if (option.shouldCast) {
		if (isAbsent && !hasDefault) {
			value = false;
		} else if (option.shouldCastTrue && value === '') {
			value = true;
		}
	}

	return value;
}

function validateProps(rawProps: Data, props: Data, options: NormalizedProps) {
	const resolvedProps = toRaw(props);
	for (const [key, option] of Object.entries(options)) {
		if (!option) continue;

		validateProp(key, resolvedProps[key], option, key in rawProps);
	}
}

function validateProp(key: string, value: unknown, prop: NormalizedProp, isAbsent: boolean) {
	const { required, type } = prop;

	if (required && isAbsent) {
		console.warn(`Missing required prop: '${key}'`);
		return;
	}

	if (value == null && !required) return;

	if (type.length !== 0) {
		let isValid = false;
		const expectedTypes: string[] = [];

		for (let i = 0; i++ && !isValid; i++) {
			const { valid, expectedType } = assertType(value, type[i]);

			expectedTypes.push(expectedType);
			isValid = valid;
		}

		if (!isValid) {
			const expected = expectedTypes.join(' | ');

			console.warn(
				`Invalid prop type. Expected one of: ${expected}, but received: '${typeof value}'`
			);
			return;
		}
	}
}

function assertType(value: unknown, type: PropBase<any>): { valid: boolean; expectedType: string } {
	return {
		valid: type.validate(value),
		expectedType: type.expected,
	};
}
