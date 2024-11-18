export const FRAMEWORK_NAME = 'Ovee.js';

export const __DEV__ = process.env.NODE_ENV !== 'production';

export const NOOP = () => {};

export const NOOP_PROMISE = () => new Promise<void>(res => res());
