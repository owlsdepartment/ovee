export function flushPromises(): Promise<NodeJS.Immediate> {
	return new Promise(jest.requireActual('timers').setImmediate);
}
