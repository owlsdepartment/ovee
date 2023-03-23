import { afterAll, beforeEach, vi } from 'vitest';

export function spyConsole(method: 'log' | 'warn' | 'error' | 'info', silent = true) {
	const spy = vi.spyOn(console, method);

	beforeEach(() => {
		spy.mockClear();

		if (silent) spy.mockImplementation(() => {});
	});

	afterAll(() => {
		spy.mockRestore();
	});

	return spy;
}
