import { WatchSource } from '@vue/runtime-core';
import { AnyObject } from 'src/utils';

export type MultiWatchSources = (WatchSource<unknown> | AnyObject)[];
export type MapSources<T, Immediate> = {
	[K in keyof T]: T[K] extends WatchSource<infer V>
		? Immediate extends true
			? V | undefined
			: V
		: T[K] extends AnyObject
		? Immediate extends true
			? T[K] | undefined
			: T[K]
		: never;
};

export {
	watch as doWatch,
	watchEffect as doWatchEffect,
	WatchCallback,
	WatchEffect,
	WatchOptions,
	WatchOptionsBase,
	WatchSource,
	WatchStopHandle,
} from '@vue/runtime-core';
