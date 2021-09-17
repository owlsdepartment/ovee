export function spyConsole(method: 'log' | 'warn' | 'error' | 'info') {
	const spy: { console: jest.SpyInstance } = {} as any;

	beforeEach(() => {
		spy.console = jest.spyOn(console, method).mockImplementation(() => {});
	});

	afterEach(() => {
		spy.console.mockRestore();
	});

	return spy;
}
