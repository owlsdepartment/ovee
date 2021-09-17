export function spyConsole(method: 'log' | 'warning' | 'error') {
	const spy: { console: jest.SpyInstance } = {} as any;

	beforeEach(() => {
		spy.console = jest.spyOn(console, method as any).mockImplementation(() => {});
	});

	afterEach(() => {
		spy.console.mockRestore();
	});

	return spy;
}
