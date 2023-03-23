import { beforeEach } from 'vitest';

import { App, AppConfigurator, createApp } from '@/core';

export function createTestApp(updateConfig?: (config: AppConfigurator) => void) {
	const stub = {
		app: null,
		appConfig: null,
	} as any as { app: App; appConfig: AppConfigurator };
	const _createApp = () => new App(stub.appConfig, document.body);

	beforeEach(() => {
		stub.appConfig = createApp();
		updateConfig?.(stub.appConfig);
		stub.app = _createApp();
	});

	return stub;
}
