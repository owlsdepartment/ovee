/* eslint-disable max-classes-per-file */
import barba, { IBarbaOptions, LinkEvent, Trigger } from '@barba/core';
import barbaCss from '@barba/css';
import barbaPrefetch from '@barba/prefetch';
import barbaRouter, { IRoute } from '@barba/router';
import { Module } from 'ovee.js';

declare module 'ovee.js' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	class App {
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

export type BarbaRoute = IRoute;

export interface OveeBarbaOptions extends IBarbaOptions {
	useCss?: boolean;
	usePrefetch?: boolean;
	useRouter?: boolean;
	hooks?: BarbaHooks;
	routes?: BarbaRoute[];
}

export type BarbaHooks = Partial<Record<Hook, () => any>>;

const defaultOptions: OveeBarbaOptions = {
	useCss: false,
	useRouter: false,
	usePrefetch: true,
};

export default class extends Module<OveeBarbaOptions> {
	get hooks(): BarbaHooks {
		return this.options.hooks ?? {};
	}

	init(): void {
		this.options = {
			...defaultOptions,
			...this.options,
		};

		this.usePrefetch();
		this.useCss();
		this.useRouter();

		barba.init(this.options);
		this.initHooks();

		this.$app.$go = (...args) => barba.go(...args);
		this.$app.$prefetch = (...args) => barba.prefetch(...args);
	}

	destroy(): void {
		super.destroy();

		barba.destroy();
	}

	private usePrefetch() {
		if (this.options.usePrefetch) {
			barba.use(barbaPrefetch);
		}
	}

	private useCss() {
		if (this.options.useCss) {
			barba.use(barbaCss);
		}
	}

	private useRouter() {
		const { useRouter, routes } = this.options;

		if (useRouter) {
			barba.use(barbaRouter, { routes });
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
