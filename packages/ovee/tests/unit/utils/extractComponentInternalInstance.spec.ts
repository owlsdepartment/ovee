import { describe, expect, it } from 'vitest';

import { defineComponent } from '@/core';
import { extractComponentInternalInstance } from '@/utils/extractComponentInternalInstance';
import { createComponent, createTestApp } from '#/helpers';

describe('extractComponentInternalInstance', () => {
	const BaseComponent = defineComponent(() => {});
	const BaseComponentName = 'BaseComponent';

	const _app = createTestApp(config => {
		config.component(BaseComponentName, BaseComponent);
	});

	it('returns undefined if passed component is not present', () => {
		const element = document.createElement('div');

		expect(extractComponentInternalInstance(element, 'not-existing')).toBeUndefined();
		expect(extractComponentInternalInstance(element, BaseComponent, _app.app)).toBeUndefined();
	});

	it("returns component's internal instance via component's name", () => {
		const element = document.createElement('div');
		const instance = createComponent(BaseComponent, {
			name: BaseComponentName,
			element,
			app: _app.app,
		});
		const retrievedInstance = extractComponentInternalInstance(element, BaseComponentName);

		expect(retrievedInstance).toBeDefined();
		expect(retrievedInstance).toBe(instance);
	});

	it("returns component's internal instance via component's definition", () => {
		const element = document.createElement('div');
		const instance = createComponent(BaseComponent, {
			name: BaseComponentName,
			element,
			app: _app.app,
		});
		const retrievedInstance = extractComponentInternalInstance(element, BaseComponent, _app.app);

		expect(retrievedInstance).toBeDefined();
		expect(retrievedInstance).toBe(instance);
	});
});
