import { AnyObject, isString } from 'src/utils';

import { doPathWatch } from './doPathWatch';
import {
	doWatch,
	MultiWatchSources,
	WatchCallback,
	WatchOptions,
	WatchSource,
	WatchStopHandle,
} from './vue';

export function handleCombinedWatch(
	target: AnyObject,
	source: string | WatchSource | MultiWatchSources,
	cb: WatchCallback,
	options: WatchOptions = {}
): WatchStopHandle {
	return isString(source) ? doPathWatch(target, source, cb, options) : doWatch(source, cb, options);
}
