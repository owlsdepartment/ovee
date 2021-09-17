/**
 * Comes from `lodash` `isString` method
 * https://lodash.com/docs/4.17.15#isString
 */
export function isString(value: unknown): value is string {
	const type = typeof value;

	return (
		type === 'string' ||
		(type === 'object' &&
			value != null &&
			!Array.isArray(value) &&
			getTag(value) == '[object String]')
	);
}

function getTag(value: any) {
	if (value == null) {
		return value === undefined ? '[object Undefined]' : '[object Null]';
	}

	return toString.call(value);
}
