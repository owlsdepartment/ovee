import { beforeEach, describe, expect, it } from 'vitest';

import { App, AppConfigurator, createApp, useApp } from '@/core';
import { ComponentInternalContext, provideComponentContext } from '@/core/component';
import { resetComponentContext } from '@/core/component/componentContext';
import { ModuleInternalContext, provideModuleContext } from '@/core/module';
import { resetModuleContext } from '@/core/module/moduleContext';
import { createLoggerRegExp } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useApp');

describe('useApp', () => {
	let appConfig: AppConfigurator;
	let app: App;
	let componentContext: ComponentInternalContext;
	let moduleContext: ModuleInternalContext;
	const _createApp = () => new App(appConfig, document.body);

	beforeEach(() => {
		appConfig = createApp();
		app = _createApp();
		componentContext = {
			app,
		} as any;
		moduleContext = {
			app,
		} as any;
	});

	beforeEach(() => {
		resetComponentContext();
		resetModuleContext();
	});

	it('should throw error, when used without existing context', () => {
		expect(() => useApp()).toThrow(loggerRegExp);
	});

	it(`should return 'null' when 'allowMissingContext' is set to true`, () => {
		const ctx = useApp(true);

		expect(ctx).toBeNull();
	});

	it('should return app when component context is provided', () => {
		provideComponentContext(componentContext);

		const appCtx = useApp();

		expect(appCtx).toBe(app);
	});

	it('should return app when module context is provided', () => {
		provideModuleContext(moduleContext);

		const appCtx = useApp();

		expect(appCtx).toBe(app);
	});
});
