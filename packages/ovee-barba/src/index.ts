/* eslint-disable max-classes-per-file */
import barba, { IBarbaOptions, IBarbaPlugin, LinkEvent, Trigger } from '@barba/core';
import { Module } from 'ovee.js';

declare module 'ovee.js' {
	interface App {
		$go(href: string, trigger?: Trigger, e?: LinkEvent | PopStateEvent): Promise<void>;
		$prefetch(href: string): void;
	}
}

type Hook =
	| 'before'
	| 'beforeLeave'
	| 'leave'
	| 'afterLeave'
	| 'beforeEnter'
	| 'enter'
	| 'afterEnter'
	| 'after';

export interface OveeBarbaOptions extends IBarbaOptions {
	plugins: BarbaPlugin[];
	hooks: BarbaHooks;
}

export type BarbaHooks = Partial<Record<Hook, () => any>>;

export type BarbaPlugin<T = any> = IBarbaPlugin<T> | [IBarbaPlugin<T>, T];

const defaultOptions: OveeBarbaOptions = {
	plugins: [],
	hooks: {},
};

export class OveeBarba extends Module<OveeBarbaOptions> {
	get hooks(): BarbaHooks {
		return this.options.hooks ?? {};
	}

	init(): void {
		this.options = {
			...defaultOptions,
			...this.options,
		};

		this.checkOptions();
		this.usePlugins();

		barba.init(this.options);
		this.initHooks();

		this.$app.$go = (...args) => barba.go(...args);
		this.$app.$prefetch = (...args) => barba.prefetch(...args);
	}

	destroy(): void {
		super.destroy();

		barba.destroy();
	}

	private checkOptions(): void {
		const opt = this.options as any;

		if (opt.useCss || opt.useRouter || opt.usePrefetch) {
			throw Error(
				`[@ovee/barba] One of old options 'useCss' or 'useRouter' or 'usePrefetch' was used in options object, which is deprecated. To use barba plugins, you need to install them and pass in 'plugins' field.`
			);
		}
	}

	private usePlugins(): void {
		for (const plugin of this.options.plugins) {
			if (Array.isArray(plugin)) {
				barba.use(plugin[0], plugin[1]);
			} else {
				barba.use(plugin);
			}
		}
	}

	private initHooks(): void {
		this.registerHook('before');
		this.registerHook('beforeLeave', 'before-leave');
		this.registerHook('leave');
		this.registerHook('afterLeave', 'after-leave');
		this.registerHook('beforeEnter', 'before-enter');

		barba.hooks.enter(data => {
			const { next } = data ?? {};
			const { bodyClass } = next!.container.dataset;

			this.$app.getConfig().document.body.classList.value = bodyClass ?? '';

			this.callHook('enter');
		});

		this.registerHook('afterEnter', 'after-enter');
		this.registerHook('after');
	}

	private registerHook(name: Hook, appName?: string): void {
		barba.hooks[name](() => this.callHook(name, appName));
	}

	private callHook(name: Hook, appName?: string): void {
		// eslint-disable-next-line no-unused-expressions
		this.hooks[name]?.();
		this.$app.$emit(`barba:${appName ?? name}`);
	}

	static getName(): string {
		return 'OveeBarba';
	}
}
