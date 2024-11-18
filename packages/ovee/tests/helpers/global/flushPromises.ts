export function flushPromises(): Promise<void> {
	return new Promise(res => setImmediate(res));
}
