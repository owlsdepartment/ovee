import { describe, expect, it } from 'vitest';

import { AppConfigurator, createApp, defaultConfig } from '@/core';

describe('createApp', () => {
	it('should return AppConfigurator instance', () => {
		const app = createApp();

		expect(app).toBeInstanceOf(AppConfigurator);
	});

	it('should populate config with default config values', () => {
		const app = createApp();

		expect(app.config).toEqual(defaultConfig);
	});

	it('should merge default config with received one', () => {
		const customConfig = { namespace: 'my-namespace' };
		const app = createApp(customConfig);

		expect(app.config).toEqual({ ...defaultConfig, namespace: customConfig.namespace });
	});
});
