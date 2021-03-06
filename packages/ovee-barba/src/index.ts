/* eslint-disable max-classes-per-file */
import barba, { IBarbaOptions, Trigger, LinkEvent } from '@barba/core';
import barbaCss from '@barba/css';
import barbaPrefetch from '@barba/prefetch';
import { Module } from 'ovee.js';

declare module 'ovee.js' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class App {
        $go(href: string, trigger?: Trigger, e?: LinkEvent | PopStateEvent): Promise<void>;
        $prefetch(href: string): void;
    }
}

type Hook = 'before' | 'beforeLeave' | 'leave' | 'afterLeave' | 'beforeEnter' | 'enter' | 'afterEnter' | 'after'

export interface OveeBarbaOptions extends IBarbaOptions {
    useCss: boolean;
    usePrefetch: boolean;
    hooks: Partial<Record<Hook, () => any>>;
}

const defaultOptions: OveeBarbaOptions = {
    useCss: false,
    usePrefetch: true,
    hooks: {}
};

export default class extends Module<OveeBarbaOptions> {
    init(): void {
        this.options = {
            ...defaultOptions,
            ...this.options
        };

        if (this.options.usePrefetch) {
            barba.use(barbaPrefetch);
        }

        if (this.options.useCss) {
            barba.use(barbaCss);
        }

        barba.init(this.options);

        barba.hooks.before(() => {
            this.$app.$emit('barbaBefore');
            this.callHook('before');
        });

        barba.hooks.beforeLeave(() => {
            this.callHook('beforeLeave');
        });

        barba.hooks.leave(() => {
            this.callHook('leave');
        });

        barba.hooks.afterLeave(() => {
            this.callHook('afterLeave');
        });

        barba.hooks.beforeEnter(() => {
            this.callHook('beforeEnter');
        });

        barba.hooks.enter((data) => {
            const { next } = data ?? {};
            const { bodyClass } = next!.container.dataset;

            this.$app.getConfig().document.body.classList.value = bodyClass ?? '';

            this.$app.$emit('barbaEnter');
            this.callHook('enter');
        });

        barba.hooks.afterEnter(() => {
            this.callHook('afterEnter');
        });

        barba.hooks.after(() => {
            this.$app.$emit('barbaAfter');
            this.callHook('after');
        });

        this.$app.$go = (...args) => barba.go(...args);

        this.$app.$prefetch = (...args) => barba.prefetch(...args);
    }

    destroy(): void {
        super.destroy();

        barba.destroy();
    }

    private callHook(name: Hook): void {
        // eslint-disable-next-line no-unused-expressions
        this.options.hooks[name]?.();
    }

    static getName(): string {
        return 'OveeBarba';
    }
}
