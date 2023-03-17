import { FRAMEWORK_NAME } from '@/constants';
import {
	Callback,
	emitEvent,
	EventDelegate,
	EventDesc,
	ListenerOptions,
	TargetOptions,
} from '@/dom';

import { Module } from '../defineModule';
import { AppConfigurator } from './AppConfigurator';
import { ComponentsManager } from './ComponentsManager';
import { defaultConfig } from './createApp';
import { ModulesManager } from './ModulesManager';

export interface AppManager {
	run(): void;
	destroy(): void;
}

export class App {
	readonly $eventDelegate: EventDelegate;
	readonly componentsManager: ComponentsManager;
	readonly modulesManager: ModulesManager;

	#initialized = false;

	get initialized() {
		return this.#initialized;
	}

	get config() {
		return this.configurator.config;
	}

	get document() {
		return this.config.document ?? document;
	}

	constructor(public configurator: AppConfigurator, public rootElement: HTMLElement) {
		this.modulesManager = new ModulesManager(this);
		this.componentsManager = new ComponentsManager(this);

		this.$eventDelegate = new EventDelegate(this.document, this);
	}

	run(): void {
		this.displayDevTip();

		this.modulesManager.run();
		this.componentsManager.run();

		this.bindDomEvents();
		this.#initialized = true;
		emitEvent(this.document, this.eventName('initialized'));
	}

	private bindDomEvents(): void {
		this.onDomUpdated = this.onDomUpdated.bind(this);
		this.rootElement.addEventListener(this.eventName('dom:updated'), this.onDomUpdated, {
			passive: true,
		});
	}

	onDomUpdated(e: Event): void {
		setTimeout(() => {
			if (e.target) {
				this.componentsManager.harvestComponents(e.target as HTMLElement);
			}
		});
	}

	destroy(): void {
		if (this.initialized) {
			this.rootElement.removeEventListener(this.eventName('dom:updated'), this.onDomUpdated);

			this.componentsManager.destroy();
			this.modulesManager.destroy();
		}
	}

	getModule<M extends Module>(module: M | string) {
		return this.modulesManager.getModule<M>(module);
	}

	$on(events: string, callback: Callback<any>, options?: ListenerOptions): () => void {
		return this.$eventDelegate.on(events, callback, options);
	}

	$off(events: string, callback: Callback<any>, options?: TargetOptions): void {
		return this.$eventDelegate.off(events, callback, options);
	}

	$emit<D = any>(eventDesc: EventDesc, detail?: D): void {
		this.$eventDelegate.emit(eventDesc, detail);
	}

	displayDevTip(): void {
		const env = (process.env.NODE_ENV || '').toLowerCase();

		if (env !== 'production' && env !== 'test' && this.config.productionTip !== false) {
			console.info(
				`You are running ${FRAMEWORK_NAME} in development mode.
Make sure to turn on production mode when deploying for production.`
			);
		}
	}

	eventName(name: string) {
		const namespace = this.config.namespace ?? defaultConfig.namespace;

		return namespace ? `${namespace}:${name}` : name;
	}
}
