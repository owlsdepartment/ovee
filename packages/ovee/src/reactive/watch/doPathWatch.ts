import { AnyObject } from 'src/utils';

import { doWatch, WatchCallback, WatchOptions } from './vue';

export function doPathWatch(
	target: AnyObject,
	path: string,
	cb: WatchCallback,
	options: WatchOptions = {}
) {
	const source = createPathGetter(target, path);

	if (path.endsWith('*')) {
		options.deep = true;
	}

	return doWatch(source, cb, options);
}

export function createPathGetter(ctx: AnyObject, path: string) {
	if (!path.includes('.')) {
		return path === '*' ? () => ctx : () => ctx[path];
	}

	const segments = path.split('.');

	return () => {
		let cur = ctx;

		for (let i = 0; i < segments.length && cur; i++) {
			if (segments[i] !== '*') {
				cur = cur[segments[i]];
			}
		}

		return cur;
	};
}
