import { describe, expect, it } from 'vitest';

import { defineComponent } from '@/core';
import { extractComponent } from '@/utils';
import { createComponent, createTestApp } from '#/helpers';

describe('extractComponent', () => {
	const BaseComponent = defineComponent(() => {});
	const BaseComponentName = 'BaseComponent';

	const _app = createTestApp(config => {
		config.component(BaseComponentName, BaseComponent);
	});

	it('returns undefined if passed component is not present', () => {
		const element = document.createElement('div');

		expect(extractComponent(element, 'not-existing')).toBeUndefined();
		expect(extractComponent(element, BaseComponent, _app.app));
	});

	it("returns component's public instance via component's name", () => {
		const element = document.createElement('div');
		const instance = createComponent(BaseComponent, {
			name: BaseComponentName,
			element,
			app: _app.app,
		});
		const retrievedInstance = extractComponent(element, BaseComponentName);

		expect(retrievedInstance).toBeDefined();
		expect(retrievedInstance).toBe(instance.instance);
	});

	it("returns component's public instance via component's definition", () => {
		const element = document.createElement('div');
		const instance = createComponent(BaseComponent, {
			name: BaseComponentName,
			element,
			app: _app.app,
		});
		const retrievedInstance = extractComponent(element, BaseComponent, _app.app);

		expect(retrievedInstance).toBeDefined();
		expect(retrievedInstance).toBe(instance.instance);
	});
});
