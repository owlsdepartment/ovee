import { OwdComponent } from 'src/core/types';
import EventDelegate, { Callback, EventDesc } from 'src/dom/EventDelegate';
import ComponentError from 'src/errors/ComponentError';
import attachMutationObserver from 'src/utils/attachMutationObserver';
import isValidNode from 'src/utils/isValidNode';
import {
    Dictionary, Class, ClassConstructor
} from 'src/utils/types';

import Component, { ComponentOptions } from './Component';
import Module, { ModuleOptions } from './Module';

export interface AppConstructorParams {
    config?: Partial<AppConfig>;
    components?: RegisterPayload<Class<Component, typeof Component>, ComponentOptions>;
    modules?: RegisterPayload<ClassConstructor<Module>, ModuleOptions>;
}

export interface AppConfig {
    namespace: string;
    productionTip: boolean;
    global: Window & typeof globalThis;
    document: Document;
}

type RegisterPayload<C, O> = (C | [C, O])[]

export interface ComponentStorage<C extends Component> {
    ComponentClass: Class<C, typeof Component>;
    options: ComponentOptions;
}

const defaultConfig: AppConfig = {
    namespace: 'owd',
    productionTip: process.env.NODE_ENV !== 'production',
    global: window,
    document
};

export default class App {
    readonly modules: Dictionary<Module> = {};
    readonly components: Dictionary<ComponentStorage<Component>> = {};
    readonly $eventDelegate!: EventDelegate<any>;
    initialized = false;
    rootElement?: Element
    config!: AppConfig

    constructor({ config, components, modules }: AppConstructorParams = {}) {
        this.onDomUpdated = this.onDomUpdated.bind(this);

        this.setConfig({ ...config });

        Object.defineProperty(this, 'modules', {
            value: this.modules,
            writable: false,
            configurable: false
        });

        Object.defineProperty(this, 'components', {
            value: this.components,
            writable: false,
            configurable: false
        });

        Object.defineProperty(this, '$eventDelegate', {
            value: new EventDelegate(this.getConfig().global as any, this as any),
            writable: false,
            configurable: false
        });

        if (components) {
            this.registerComponents([...components]);
        }

        if (modules) {
            this.registerModules([...modules]);
        }
    }

    bindDomEvents(): void {
        this.rootElement?.addEventListener(
            eventName(this.config, 'dom:updated'), this.onDomUpdated.bind(this), false
        );
    }

    onDomUpdated(e: Event): void {
        setTimeout(() => {
            if (e.target) {
                this.harvestComponents(e.target as Element);
            }
        });
    }

    setConfig(config: Partial<AppConfig>): this {
        this.config = { ...defaultConfig, ...config };

        return this;
    }

    getConfig(): AppConfig {
        return { ...this.config };
    }

    registerModules(modules: RegisterPayload<ClassConstructor<Module>, ModuleOptions>): this {
        modules.forEach((module) => {
            if (Array.isArray(module)) {
                this.use(module[0], module[1]);
            } else {
                this.use(module);
            }
        });

        return this;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    use<M extends Module<Opt>, Opt extends object>(ModuleClass: ClassConstructor<M>, options?: Opt): M {
        if (!(ModuleClass.prototype instanceof Module)) {
            throw new TypeError('A module passed to use() method must be an instance of Module');
        }

        const name = (ModuleClass as any as typeof Module).getName();

        if (this.modules[name]) {
            throw new Error(`Module "${name}" is already used`);
        }

        this.modules[name] = new ModuleClass(this, options);

        return this.modules[name] as M;
    }

    initModules(): void {
        Object.values(this.modules)
            .forEach((module) => module.init());
    }

    destroyModules(): void {
        Object.values(this.modules)
            .forEach((module) => module.destroy());
    }

    getModule(name: string): Module {
        if (!this.modules[name]) {
            throw new Error(`Module "${name}" is not registered`);
        }

        return this.modules[name];
    }

    registerComponents(components: RegisterPayload<Class<Component, typeof Component>, ComponentOptions>): this {
        components.forEach((component) => {
            if (Array.isArray(component)) {
                this.registerComponent(component[0], component[1]);
            } else {
                this.registerComponent(component);
            }
        });

        return this;
    }

    registerComponent<
        C extends Component
    >(ComponentClass: Class<C, typeof Component>, options: ComponentOptions = {}): this {
        if (!(ComponentClass.prototype instanceof Component)) {
            throw new TypeError('A component passed to registerComponent() method must be an instance of Component');
        }

        const name: string = ComponentClass.getName();

        if (this.components[name]) {
            throw new Error(`Component "${name}" is already registered`);
        }

        this.components[name] = { ComponentClass, options };

        return this;
    }

    initComponents(): void {
        Object.values(this.components)
            .forEach(({ ComponentClass }) => {
                ComponentClass.register();
            });
    }

    harvestComponents(root: Element): void {
        Object.values(this.components).forEach(({ ComponentClass, options }) => {
            const name = ComponentClass.getName();
            const selector = `${name}, [data-${name}]`;

            root.querySelectorAll(selector).forEach((el) => {
                this.makeComponent(el, ComponentClass, options);
            });

            if (root.matches(selector)) {
                this.makeComponent(root, ComponentClass, options);
            }
        });
    }

    destroyComponents(root: Element): void {
        Object.values(this.components).forEach(({ ComponentClass }) => {
            const name = ComponentClass.getName();
            const selector = `${name}, [data-${name}]`;

            root.querySelectorAll(selector).forEach((el) => {
                this.destroyComponent(el);
            });

            if (root.matches(selector)) {
                this.destroyComponent(root);
            }
        });
    }

    attachMutationObserver(root: Element): void {
        attachMutationObserver(root, (addedNodes) => {
            Array.from(addedNodes).filter(isValidNode)
                .forEach((node) => this.harvestComponents(node));
        }, (removedNodes) => {
            Array.from(removedNodes).filter(isValidNode)
                .forEach((node) => this.destroyComponents(node));
        });
    }

    makeComponent<
        C extends Component
    >(el: Element & OwdComponent, ComponentClass: Class<C, typeof Component>, options: ComponentOptions = {}): C {
        // @todo handle multi-component elements
        if (!el._owdComponentInstance) {
            el.classList.add(`${this.config.namespace}-component`);
            el._owdComponentInstance = new ComponentClass(el, this, options) as C;
        } else if (!(el._owdComponentInstance instanceof ComponentClass)) {
            throw new ComponentError(
                'Component instance has already been initialized for this element',
                el,
                el._owdComponentInstance
            );
        }

        return el._owdComponentInstance as C;
    }

    destroyComponent(el: Element & OwdComponent): void {
        if (el._owdComponentInstance) {
            el._owdComponentInstance.$destroy();
            delete el._owdComponentInstance;
            el.classList.remove(`${this.config.namespace}-component`);
        }
    }

    displayProductionTip(): void {
        if (process.env.NODE_ENV !== 'production'
            && process.env.NODE_ENV !== 'test'
            && this.config.productionTip !== false) {
            console.info(
                'You are running OWD.JS in development mode.\n'
                + 'Make sure to turn on production mode when deploying for production.'
            );
        }
    }

    $on(events: string, callback: Callback<any>): this;
    $on(events: string, target: Element, callback: Callback<any>): this;
    $on(events: string, target: any, callback?: any): this {
        this.$eventDelegate.on(events, target, callback);

        return this;
    }

    $off(events: string, callback: Callback<any>): this;
    $off(events: string, target: Element, callback: Callback<any>): this;
    $off(events: string, target: any, callback?: any): this {
        this.$eventDelegate.off(events, target, callback);

        return this;
    }

    $emit<D = any>(eventDesc: EventDesc, detail?: D): void {
        this.$eventDelegate.emit(eventDesc, detail);
    }

    run(rootElement: Element): void {
        this.rootElement = rootElement;
        this.displayProductionTip();
        this.initModules();
        this.initComponents();
        this.bindDomEvents();
        this.attachMutationObserver(rootElement);

        setTimeout(() => {
            this.harvestComponents(this.rootElement!);
            this.initialized = true;
            this.config.document.dispatchEvent(new this.config.global.Event(eventName(this.config, 'initialized')));
        });
    }

    destroy(): void {
        if (this.initialized) {
            this.config.document.removeEventListener(eventName(this.config, 'dom:updated'), this.onDomUpdated);
            this.destroyComponents(this.rootElement!);
            this.destroyModules();
        }
    }
}

function eventName({ namespace }: { namespace: string }, name: string) {
    if (!namespace || !name) {
        throw new Error('eventName function should be called with proper config and name as params');
    }

    return `${namespace}:${name}`;
}
