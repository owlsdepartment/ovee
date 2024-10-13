import { EffectScope, effectScope, reactive, ShallowRef, shallowRef } from '@vue/reactivity';

import { EventDelegate, EventDesc, ListenerOptions, TargetOptions } from '@/dom';
import { SlotChildren } from '@/jsx';
import { AnyFunction, AnyObject, Data, EventBus, OmitNil, runThrowable } from '@/utils';

import { App } from '../app';
import { provideComponentContext } from './componentContext';
import { Component, ComponentOptions, ComponentReturn } from './defineComponent';
import { NormalizedProps, PropsDefinition, resolvePropsValues } from './props';
import { ComponentContext, ComponentInstance, WithOveeInstances } from './types';

export class ComponentInternalInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
> implements ComponentInstance<Root, Options, Props>
{
	mounted = false;
	beforeMountBus = new EventBus('onBeforeMount');
	mountBus = new EventBus('onMounted');
	unmountBus = new EventBus('onUnmounted');
	props = reactive({}) as Props;
	renderPromise?: Promise<void>;
	jsxSlot?: ShallowRef<SlotChildren>;

	readonly instance: OmitNil<Return>;
	readonly eventDelegate: EventDelegate<this>;
	readonly scope: EffectScope;

	private cachedPropsDefaults: AnyObject = {};

	get unmounted() {
		return !this.mounted;
	}

	get oveeElement() {
		return this.element as Root & WithOveeInstances;
	}

	get rawProps(): NormalizedProps {
		return this.component.__ovee_props;
	}

	private get componentContext(): ComponentContext<Options, Props> {
		return {
			name: this.name,
			app: this.app,
			options: this.options as Options,
			props: this.props,

			emit: (...args) => this.emit(...args),
			on: (...args) => this.on(...args),
			off: (...args) => this.off(...args),
		};
	}

	constructor(
		public name: string,
		public element: Root,
		public app: App,
		public component: Component<Root, Options, PropsDefinition, Return>,
		public options: Options,
		jsxSlot?: SlotChildren,
		preSetup?: (instance: ComponentInternalInstance) => void
	) {
		this.eventDelegate = new EventDelegate(element, this);

		if (jsxSlot) this.jsxSlot = shallowRef(jsxSlot);

		preSetup?.(this as any);

		const cleanUp = provideComponentContext(this);

		this.scope = effectScope(true);
		this.instance = this.scope.run(() => {
			return (
				runThrowable('component setup', () => component(element, this.componentContext)) ??
				({} as any)
			);
		});

		cleanUp();

		this.saveInstanceOnElement();
		this.scope.run(() => this.beforeMountBus.emit());
	}

	mount() {
		if (this.mounted) return;
		if (this.renderPromise) {
			this.renderPromise.then(() => {
				if (!this.renderPromise) return;

				this.renderPromise = undefined;
				this.mount();
			});

			return;
		}

		this.mounted = true;
		this.scope.run(() => this.mountBus.emit());
	}

	unmount() {
		if (!this.mounted) return;

		this.mounted = false;
		this.scope.stop();
		this.unmountBus.emit();
		this.eventDelegate.destroy();
	}

	saveInstanceOnElement() {
		const self = this as any as ComponentInternalInstance;

		if (!this.oveeElement._OveeComponentInstances) {
			this.oveeElement._OveeComponentInstances = [self];
		} else {
			if (this.oveeElement._OveeComponentInstances.includes(self)) return;

			this.oveeElement._OveeComponentInstances.push(self);
		}
	}

	on(events: string, callback: AnyFunction, options?: ListenerOptions): () => void {
		return this.eventDelegate.on(events, callback, options);
	}

	off(events: string, callback: AnyFunction, options?: TargetOptions): void {
		return this.eventDelegate.off(events, callback, options);
	}

	emit<D = any>(eventDesc: EventDesc, detail?: D): void {
		this.eventDelegate.emit(eventDesc, detail);
	}

	/**
	 * @returns omitted props, not included in generation
	 */
	updateProps(rawProps: Data): Data {
		return resolvePropsValues(
			rawProps,
			this.props,
			this.component.__ovee_props,
			this.cachedPropsDefaults
		);
	}
}
