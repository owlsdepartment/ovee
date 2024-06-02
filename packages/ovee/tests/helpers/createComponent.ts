import { App, Component, ComponentOptions, createApp } from '@/core';
import { ComponentInternalInstance } from '@/core/component';
import { toKebabCase } from '@/utils';

interface Config {
	name?: string;
	element?: HTMLElement;
	app?: App;
	options?: ComponentOptions;
}

export function createComponent(
	component: Component,
	{ name, element, app, options = {} }: Config = {},
	mountInitially = true
) {
	if (!app) {
		const appConfig = createApp();

		app = new App(appConfig, document.body);
	}
	element ??= document.createElement('div');

	const instance = new ComponentInternalInstance(
		toKebabCase(name ?? ''),
		element,
		app,
		component,
		options
	);

	if (mountInitially) instance.mount();

	return instance;
}
