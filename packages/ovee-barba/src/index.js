import { Module } from 'owd';
import barba from '@barba/core';
import barbaPrefetch from '@barba/prefetch';
import barbaCss from '@barba/css';

const defaultOptions = {
    useCss: false,
    usePrefetch: true
};

export default class extends Module {
    init() {
        this.options = { ...defaultOptions, ...this.options };

        if (this.options.usePrefetch) {
            barba.use(barbaPrefetch);
        }

        if (this.options.useCss) {
            barba.use(barbaCss);
        }

        barba.init(this.options);

        const { global } = this.$app.getConfig();

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

        barba.hooks.enter(({ next }) => {
            const { bodyClass } = next.container.dataset;

            this.$app.getConfig().document.body.classList.value = bodyClass;

            this.$app.$emit('barbaEnter');
            this.callHook('enter');
        });

        barba.hooks.afterEnter(() => {
            this.callHook('afterEnter');
        });

        barba.hooks.after(() => {
            if (global.dataLayer !== undefined) {
                try {
                    global.dataLayer.push({
                        event: 'content-view',
                        'content-name': global.location.pathname
                    });
                // eslint-disable-next-line no-empty
                } catch (e) {}
            }

            if (global.ga !== undefined) {
                try {
                    global.ga('send', 'pageview', {
                        page: global.location.pathname,
                        title: document.querySelector('head > title').text()
                    });
                // eslint-disable-next-line no-empty
                } catch (e) {}
            }

            this.$app.$emit('barbaAfter');
            this.callHook('after');
        });

        this.$app.$go = (...args) => {
            barba.go(...args);
        };

        this.$app.$prefetch = (...args) => {
            barba.prefetch(...args);
        };
    }

    callHook(name) {
        if (this.options?.hooks?.[name]) {
            // eslint-disable-next-line no-unused-expressions
            this.options?.hooks?.[name]();
        }
    }

    destroy() {
        super.destroy();

        barba.destroy();
    }

    static getName() {
        return 'owdBarba';
    }
}
