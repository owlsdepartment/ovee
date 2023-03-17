import { attachMutationObserver, isValidNode } from '@/utils';

import { setupComponent, StoredComponent } from '../setupComponent';
import { ComponentInternalInstance, HTMLOveeElement } from '../types';
import { App, AppManager } from './App';
import { AppConfigurator } from './AppConfigurator';

export class ComponentsManager implements AppManager {
	configurator: AppConfigurator;
	storedComponents = new Map<string, StoredComponent>();
	componentsToMount = new Array<ComponentInternalInstance>();
	mountTimeout: null | ReturnType<typeof setTimeout> = null;

	get componentCssClass() {
		return `${this.configurator.config.namespace}-component`;
	}

	get root() {
		return this.app.rootElement;
	}

	constructor(public app: App) {
		this.configurator = app.configurator;

		this.setupComponents();
	}

	run() {
		this.attachMutationObserver(this.root);
		this.harvestComponents(this.root);
	}

	destroy() {
		if (this.mountTimeout) clearTimeout(this.mountTimeout);

		this.destroyComponents(this.root);
	}

	private setupComponents(): void {
		this.configurator.registeredComponents.forEach(({ name, component, options }) => {
			this.storedComponents.set(name, setupComponent(this.app, name, component, options));
		});
	}

	private attachMutationObserver(root: HTMLElement): void {
		attachMutationObserver(
			root,
			addedNodes => {
				addedNodes.filter(isValidNode).forEach(el => this.harvestComponents(el));
			},
			removedNodes => {
				removedNodes
					.filter(isValidNode)
					// when node is moved, both callbacks are called. To avoid instant destruction, we filter those that were moved and not destroyed
					.filter(node => !node.parentNode)
					.forEach(el => this.destroyComponents(el));
			}
		);
	}

	harvestComponents(root: HTMLElement): void {
		this.forEachFoundComponent(root, (el, c) => {
			this.makeComponent(el, c);
		});
	}

	destroyComponents(root: HTMLElement): void {
		this.forEachFoundComponent(root, el => {
			this.destroyComponent(el);
		});
	}

	private forEachFoundComponent(
		root: HTMLElement,
		cb: (el: HTMLElement, component: StoredComponent) => void
	) {
		this.storedComponents.forEach(c => {
			const selector = `[data-${c.name}]`;

			root.querySelectorAll(selector).forEach(el => {
				if (el instanceof HTMLElement) {
					cb(el, c);
				}
			});

			if (root.matches(selector)) {
				cb(root, c);
			}
		});
	}

	private makeComponent(el: HTMLOveeElement, { component, factory }: StoredComponent) {
		if (el._OveeComponentInstances?.find(i => i.component === component)) return;

		if (!el._OveeComponentInstances) {
			el._OveeComponentInstances = [];
		}

		const internalInstance = factory();

		el.classList.add(this.componentCssClass);
		el._OveeComponentInstances.push(internalInstance);
		this.addComponentsToMount(internalInstance);
	}

	private destroyComponent(el: HTMLOveeElement): void {
		if (el._OveeComponentInstances) {
			el._OveeComponentInstances.forEach(i => i.unmount());
			el.classList.remove(this.componentCssClass);
			delete el._OveeComponentInstances;
		}
	}

	addComponentsToMount(...components: ComponentInternalInstance[]) {
		this.componentsToMount.push(...components);

		this.scheduleComponentsMount();
	}

	private scheduleComponentsMount() {
		if (this.mountTimeout) return;

		this.mountTimeout = setTimeout(() => {
			this.mountComponents();
		});
	}

	private mountComponents() {
		this.mountTimeout = null;

		this.componentsToMount.forEach(c => c.mount());
	}
}
