import { afterAll, beforeEach, vi } from 'vitest';

export function spyConsole(method: 'log' | 'warn' | 'error' | 'info', silent = true) {
	const spy = vi.spyOn(console, method);
	const implementation = () => {};

	beforeEach(() => {
		spy.mockClear();

		if (silent) spy.mockImplementation(implementation);
	});

	afterAll(() => {
		spy.mockRestore();
	});

	return spy;
}
