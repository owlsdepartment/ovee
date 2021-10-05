export function waitForFrame(): Promise<void> {
	return new Promise(res => {
		requestAnimationFrame(() => res());
	});
}
