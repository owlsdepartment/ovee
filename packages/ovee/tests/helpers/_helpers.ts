import * as globalHelpers from './global';

declare global {
	const flushPromises: typeof globalHelpers.flushPromises;
	const asyncHelper: typeof globalHelpers.asyncHelper;
	const spyConsole: typeof globalHelpers.spyConsole;
	const waitForFrame: typeof globalHelpers.waitForFrame;
}

const _global = (global || window) as any;

_global.flushPromises = globalHelpers.flushPromises;
_global.asyncHelper = globalHelpers.asyncHelper;
_global.spyConsole = globalHelpers.spyConsole;
_global.waitForFrame = globalHelpers.waitForFrame;
