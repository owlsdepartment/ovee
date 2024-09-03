import barba, { IBarbaOptions, IBarbaPlugin, LinkEvent, Trigger, HooksPage } from '@barba/core';
import { defineModule, onDestroy } from 'ovee.js';

declare module 'ovee.js' {
	interface App {
		$go(href: string, trigger?: Trigger, e?: LinkEvent | PopStateEvent): Promise<void>;
		$prefetch(href: string): void;
	}
}

export interface OveeBarbaOptions extends IBarbaOptions {
	plugins: BarbaPlugin[];
	hooks: BarbaHooks;
}

export type BarbaHooks = Partial<Record<HooksPage, () => any>>;

export type BarbaPlugin<T = any> = IBarbaPlugin<T> | [IBarbaPlugin<T>, T];

export const OveeBarba = defineModule<OveeBarbaOptions>(({ app, options }) => {
	const defaultOptions: OveeBarbaOptions = {
		plugins: [],
		hooks: {},
	};	
	const hooks: BarbaHooks = options.hooks ?? {};

	options = {
		...defaultOptions,
		...options,
	};

	init();

	onDestroy(() => {
		barba.destroy();
	})

	function init() {
		checkOptions();
		usePlugins();

		barba.init(options);
		initHooks();

		app.$go = (...args) => barba.go(...args)
		app.$prefetch = (...args) => barba.prefetch(...args);
	}

	function checkOptions() {
		const opt = options as any;

		if (opt.useCss || opt.useRouter || opt.usePrefetch) {
			throw Error(
				`[@ovee/barba] One of old options 'useCss' or 'useRouter' or 'usePrefetch' was used in options object, which is deprecated. To use barba plugins, you need to install them and pass in 'plugins' field.`
			);
		}
	}

	function usePlugins() {
		for (const plugin of options.plugins) {
			if (Array.isArray(plugin)) {
				barba.use(plugin[0], plugin[1]);
			} else {
				barba.use(plugin);
			}
		}
	}

	function initHooks() {
		registerHook('before');
		registerHook('beforeLeave', 'before-leave');
		registerHook('leave');
		registerHook('afterLeave', 'after-leave');
		registerHook('beforeEnter', 'before-enter');

		barba.hooks.enter(data => {
			const { next } = data ?? {};
			const { bodyClass } = next!.container.dataset;

			app.rootElement.classList.value = bodyClass ?? '';

			callHook('enter');
		});

		registerHook('afterEnter', 'after-enter');
		registerHook('after');
	}

	function registerHook(name: HooksPage, appName?: string) {
		barba.hooks[name](() => callHook(name, appName));
	}

	function callHook(name: HooksPage, appName?: string) {
		hooks[name]?.();
		app.$emit(`barba:${appName ?? name}`);
	}
});