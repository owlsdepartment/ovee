import { AnyObject } from './types';

export function omit<T extends AnyObject, ToOmit extends keyof T>(
	obj: T,
	toOmit: ToOmit[]
): AnyObject {
	const duplicate = { ...obj };

	for (const key of toOmit) {
		if (key in duplicate) {
			delete duplicate[key];
		}
	}

	return duplicate;
}
