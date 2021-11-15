/* eslint-disable max-classes-per-file */
import App from 'src/core/App';
import Component from 'src/core/Component';
import Module from 'src/core/Module';
import { OveeComponent } from 'src/core/types';
import { EventDelegate } from 'src/dom/EventDelegate';
import { ComponentError } from 'src/errors/ComponentError';
import { attachMutationObserver } from 'src/utils/attachMutationObserver';

jest.mock('src/utils/attachMutationObserver');

describe('App class', () => {
	let _orgMutationObserver: typeof MutationObserver;

	beforeAll(() => {
		_orgMutationObserver = window.MutationObserver;
		window.MutationObserver = jest.fn();
		(window.MutationObserver as jest.Mock).mockImplementation(() => ({
			disconnect: jest.fn(),
			observe: jest.fn(),
		}));

		(attachMutationObserver as jest.Mock).mockImplementation(() => ({
			observe: jest.fn(),
			disconnect: jest.fn(),
			takeRecords: jest.fn(),
		}));
	});

	afterAll(() => {
		window.MutationObserver = _orgMutationObserver;
	});

	beforeEach(() => {
		(attachMutationObserver as jest.Mock).mockClear();
	});

	it('should initialize with default config when no options passed', () => {
		const app = new App();

		expect(app.getConfig()).toBeInstanceOf(Object);
		expect(app.getConfig().namespace).toBe('ovee');
		expect(app.getConfig().global).toBe(global);
		expect(app.getConfig().document).toBe(document);
	});

	it('should initialize with custom config retaining defaults for options that were not set', () => {
		const dummyOption = {};
		const otherDummyOption = {};
		const app = new App({
			config: {
				document: dummyOption,
				otherDummyOption,
			} as any,
		});

		expect(app.getConfig()).toBeInstanceOf(Object);
		expect(app.getConfig().namespace).toBe('ovee');
		expect(app.getConfig().global).toBe(global);
		expect(app.getConfig().document).toBe(dummyOption);
		expect((app.getConfig() as any).otherDummyOption).toBe(otherDummyOption);
	});

	it('should allow to set new config during runtime', () => {
		const app = new App();
		const dummyOption = {};

		app.setConfig({
			dummyOption,
		} as any);

		expect(app.getConfig()).toBeInstanceOf(Object);
		expect(app.getConfig().namespace).toBe('ovee');
		expect((app.getConfig() as any).dummyOption).toBe(dummyOption);
	});

	it('should register new module with use', () => {
		const app = new App();
		const moduleName = 'testModule';
		const dummyModuleConstructor = jest.fn();
		const dummyModuleOptions = { option1: true };
		const DummyModule = class extends Module<typeof dummyModuleOptions> {
			constructor(_app: any, _options = {}) {
				super(_app, _options);
				dummyModuleConstructor(_app, _options);
			}

			init() {}

			static getName() {
				return moduleName;
			}
		};

		const moduleInstance = app.use(DummyModule, dummyModuleOptions);

		expect(moduleInstance).toBeInstanceOf(DummyModule);
		expect(app.modules[moduleName]).toBeInstanceOf(DummyModule);
		expect(app.modules[moduleName]).toBe(moduleInstance);
		expect(dummyModuleConstructor).toBeCalledTimes(1);
		expect(dummyModuleConstructor).toBeCalledWith(app, dummyModuleOptions);
	});

	it('should throw error when use called with not an instance of Module', () => {
		const app = new App();
		const DummyModule = class {};

		expect(() => {
			app.use(DummyModule as any);
		}).toThrow();
	});

	it('should throw error when use called for module name conflict', () => {
		const app = new App();
		const moduleName = 'testModule';
		const DummyModule1 = class extends Module {
			static getName() {
				return moduleName;
			}

			init() {}
		};
		const DummyModule2 = class extends Module {
			static getName() {
				return moduleName;
			}

			init() {}
		};

		expect(() => {
			app.use(DummyModule1);
			app.use(DummyModule2);
		}).toThrow();
	});

	it('should initialize modules', () => {
		const dummyInit = jest.fn();
		const DummyModule = class extends Module {
			static getName() {
				return 'testModule';
			}

			init() {
				return dummyInit();
			}
		};
		const rootElement = document.createElement('div');
		const app = new App({
			modules: [DummyModule],
		});

		app.run(rootElement);

		expect(dummyInit).toBeCalledTimes(1);
	});

	it('should initialize modules passed with options', () => {
		const dummyInit = jest.fn();
		const dummyModuleOptions = {
			option1: true,
			option2: 'option 2 value',
		};
		const dummyModuleConstructor = jest.fn();
		const DummyModule = class extends Module {
			constructor(_app: any, _options = {}) {
				super(_app, _options);
				dummyModuleConstructor(_app, _options);
			}

			static getName() {
				return 'testModule';
			}

			init() {
				return dummyInit();
			}
		};
		const rootElement = document.createElement('div');
		const app = new App({
			modules: [[DummyModule, dummyModuleOptions]],
		});

		app.run(rootElement);

		expect(dummyModuleConstructor).toBeCalledTimes(1);
		expect(dummyModuleConstructor).toBeCalledWith(app, dummyModuleOptions);
	});

	it('should destroy modules', async () => {
		asyncHelper(async calls => {
			const dummyDestroy = jest.fn();
			const DummyModule = class extends Module {
				static getName() {
					return 'testModule';
				}

				init() {}

				destroy() {
					return dummyDestroy();
				}
			};
			const rootElement = document.createElement('div');
			const app = new App({
				modules: [DummyModule],
			});

			app.run(rootElement);

			await calls();

			app.destroy();
			expect(dummyDestroy).toBeCalledTimes(1);
		});
	});

	it('should dispatch initialized event when ran', async () => {
		asyncHelper(async calls => {
			const rootElement = document.createElement('div');
			const documentElement = document.createElement('body');

			documentElement.dispatchEvent = jest.fn();

			const app = new App({
				config: {
					document: documentElement,
				} as any,
			});

			app.run(rootElement);

			await calls();

			const dispatch = documentElement.dispatchEvent as jest.Mock;

			expect(dispatch).toBeCalledTimes(1);
			expect(dispatch.mock.calls[0][0]).toBeInstanceOf(Event);
			expect(dispatch.mock.calls[0][0].type).toBe('ovee:initialized');
		});
	});

	it('should return a module instance when registered', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dummyInit = jest.fn();
		const dummyModuleName = 'testModule';
		const DummyModule = class extends Module {
			init() {}

			static getName() {
				return dummyModuleName;
			}
		};
		const rootElement = document.createElement('div');
		const app = new App({
			modules: [DummyModule],
		});

		app.run(rootElement);

		expect(() => {
			expect(app.getModule(dummyModuleName)).toBeInstanceOf(DummyModule);
		}).not.toThrow();
	});

	it('should throw an error when trying to get an instance of not registered module', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dummyInit = jest.fn();
		const dummyModuleName = 'nonExistantModule';
		const rootElement = document.createElement('div');
		const app = new App();

		app.run(rootElement);

		expect(() => {
			app.getModule(dummyModuleName);
		}).toThrow(`Module "${dummyModuleName}" is not registered`);
	});

	it('should register a component without options if none passed', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dummyInit = jest.fn();
		const dummyComponentName = 'dummyComponent';
		const rootElement = document.createElement('div');
		const dummyRegister = jest.fn();
		const DummyComponent = class extends Component {
			static register(...args: any[]) {
				dummyRegister(...args);
			}

			static getName() {
				return dummyComponentName;
			}
		};
		const app = new App({
			components: [DummyComponent],
		});

		app.run(rootElement);

		expect(app.components).toBeInstanceOf(Object);
		expect(app.components[dummyComponentName].ComponentClass).toBe(DummyComponent);
		expect(app.components[dummyComponentName].options).toBeInstanceOf(Object);
		expect(dummyRegister).toBeCalledTimes(1);
	});

	it('should register a component with options if passed', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dummyInit = jest.fn();
		const dummyComponentName = 'dummyComponent';
		const rootElement = document.createElement('div');
		const dummyRegister = jest.fn();
		const componentOptions = { option1: true };
		const DummyComponent = class extends Component {
			static register(...args: any[]) {
				dummyRegister(...args);
			}

			static getName() {
				return dummyComponentName;
			}
		};
		const app = new App({
			components: [[DummyComponent, componentOptions]],
		});

		app.run(rootElement);

		expect(app.components).toBeInstanceOf(Object);
		expect(app.components[dummyComponentName].ComponentClass).toBe(DummyComponent);
		expect(app.components[dummyComponentName].options).toBe(componentOptions);
		expect(dummyRegister).toBeCalledTimes(1);
	});

	it('should throw an error if trying to register a non-component class', () => {
		const rootElement = document.createElement('div');
		const app = new App();
		const NotReallyAComponent = class {};
		app.run(rootElement);

		expect(() => {
			app.registerComponent(NotReallyAComponent as any);
		}).toThrow('A component passed to registerComponent() method must be an instance of Component');
	});

	it('should throw an error if trying to register another component with the same name', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const dummyInit = jest.fn();
		const dummyComponentName = 'dummyComponent';
		const rootElement = document.createElement('div');
		const DummyComponent = class extends Component {
			static register() {}

			static getName() {
				return dummyComponentName;
			}
		};
		const DummyComponent2 = class extends Component {
			static register() {}

			static getName() {
				return dummyComponentName;
			}
		};
		const app = new App();

		app.run(rootElement);

		expect(() => {
			app.registerComponent(DummyComponent);
			app.registerComponent(DummyComponent2);
		}).toThrow(`Component "${dummyComponentName}" is already registered`);
	});

	it('should display production info by default', () => {
		const _consoleInfo = console.info;
		const _env = process.env.NODE_ENV;
		console.info = jest.fn();
		process.env.NODE_ENV = 'development';

		const rootElement = document.createElement('div');
		const app = new App();

		app.run(rootElement);

		expect(console.info).toBeCalledTimes(1);
		expect(console.info).toBeCalledWith(
			'You are running Ovee.js in development mode.\n' +
				'Make sure to turn on production mode when deploying for production.'
		);

		console.info = _consoleInfo;
		process.env.NODE_ENV = _env;
	});

	it('should not display production info if NODE_ENV set to production', () => {
		const _consoleInfo = console.info;
		const _env = process.env.NODE_ENV;
		console.info = jest.fn();
		process.env.NODE_ENV = 'production';

		const rootElement = document.createElement('div');
		const app = new App();

		app.run(rootElement);

		expect(console.info).toBeCalledTimes(0);

		console.info = _consoleInfo;
		process.env.NODE_ENV = _env;
	});

	it('should not display production info if NODE_ENV set to test', () => {
		const _consoleInfo = console.info;
		const _env = process.env.NODE_ENV;
		console.info = jest.fn();
		process.env.NODE_ENV = 'test';

		const rootElement = document.createElement('div');
		const app = new App();

		app.run(rootElement);

		expect(console.info).toBeCalledTimes(0);

		console.info = _consoleInfo;
		process.env.NODE_ENV = _env;
	});

	it('should not display production info if productionTip disabled in config', () => {
		const _consoleInfo = console.info;
		const _env = process.env.NODE_ENV;
		console.info = jest.fn();
		process.env.NODE_ENV = 'development';

		const rootElement = document.createElement('div');
		const app = new App({
			config: {
				productionTip: false,
			},
		});

		app.run(rootElement);

		expect(console.info).toBeCalledTimes(0);

		console.info = _consoleInfo;
		process.env.NODE_ENV = _env;
	});

	it('should attach mutation observer to root element', () => {
		const rootElement = document.createElement('div');
		const app = new App();

		app.run(rootElement);

		const observer = attachMutationObserver as jest.Mock;

		expect(observer).toBeCalledTimes(1);
		expect(observer.mock.calls[0][0]).toBe(rootElement);
		expect(observer.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(observer.mock.calls[0][2]).toBeInstanceOf(Function);
	});

	it('should create components instnces for matching selectors found in root element', async () => {
		asyncHelper(async calls => {
			const rootElement = document.createElement('div');
			const dummyComponent1Name = 'component-1';
			const dummyComponent2Name = 'component-2';

			rootElement.innerHTML = `
                <${dummyComponent1Name} id="e1"></${dummyComponent1Name}>
                <div class="not-a-component" id="e2">
                    <div data-${dummyComponent1Name} id="e3">
                        <${dummyComponent2Name} id="e4"></${dummyComponent2Name}>
                    </div>
                </div>
            `;

			const dummyConstructor1 = jest.fn();
			const DummyComponent1 = class extends Component {
				constructor(...args: ComponentArgs) {
					super(...args);
					dummyConstructor1(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent1Name;
				}
			};

			const dummyConstructor2 = jest.fn();
			const DummyComponent2 = class extends Component {
				constructor(...args: ComponentArgs) {
					super(...args);
					dummyConstructor2(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent2Name;
				}
			};
			const dummyComponent2Options = { option1: true };

			const app = new App({
				components: [DummyComponent1, [DummyComponent2, dummyComponent2Options]],
			});

			app.run(rootElement);

			await calls();

			const getOveeInstance = (selector: string) =>
				(rootElement.querySelector(selector) as OveeComponent)._oveeComponentInstance;

			expect(dummyConstructor1).toBeCalledTimes(2);
			expect(dummyConstructor1.mock.calls[0][0]).toBe(rootElement.querySelector('#e1'));
			expect(dummyConstructor1.mock.calls[0][1]).toBe(app);
			expect(dummyConstructor1.mock.calls[0][2]).toEqual({});
			expect(dummyConstructor1.mock.calls[1][0]).toBe(rootElement.querySelector('#e3'));
			expect(dummyConstructor1.mock.calls[1][1]).toBe(app);
			expect(dummyConstructor1.mock.calls[1][2]).toEqual({});
			expect(dummyConstructor2).toBeCalledTimes(1);
			expect(dummyConstructor2.mock.calls[0][0]).toBe(rootElement.querySelector('#e4'));
			expect(dummyConstructor2.mock.calls[0][1]).toBe(app);
			expect(dummyConstructor2.mock.calls[0][2]).toBe(dummyComponent2Options);
			expect(getOveeInstance('#e1')).toBeInstanceOf(DummyComponent1);
			expect(getOveeInstance('#e2')).not.toBeDefined();
			expect(getOveeInstance('#e3')).toBeInstanceOf(DummyComponent1);
			expect(getOveeInstance('#e4')).toBeInstanceOf(DummyComponent2);
		});
	});

	it('should create component instnce if root matches component selector', async () => {
		asyncHelper(async calls => {
			const dummyComponent1Name = 'component-1';
			const rootElement = document.createElement(dummyComponent1Name);

			const dummyConstructor1 = jest.fn();
			const DummyComponent1 = class extends Component {
				constructor(...args: ComponentArgs) {
					super(...args);
					dummyConstructor1(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent1Name;
				}
			};

			const app = new App({
				components: [DummyComponent1],
			});

			app.run(rootElement);

			await calls();

			expect(dummyConstructor1).toBeCalledTimes(1);
			expect(dummyConstructor1.mock.calls[0][0]).toBe(rootElement);
			expect(dummyConstructor1.mock.calls[0][1]).toBe(app);
			expect(dummyConstructor1.mock.calls[0][2]).toEqual({});
			expect((rootElement as OveeComponent)._oveeComponentInstance).toBeInstanceOf(DummyComponent1);
		});
	});

	it("should not destroy component when it's moved", async () => {
		asyncHelper(async calls => {
			const dummyComponent1Name = 'component-1';
			const rootElement = document.createElement('div');
			const child = document.createElement('div');
			const component = document.createElement(dummyComponent1Name);

			rootElement.appendChild(child);
			child.appendChild(component);

			const dummyDestroy1 = jest.fn();
			const DummyComponent1 = class extends Component {
				static register() {}

				static getName() {
					return dummyComponent1Name;
				}

				destroy() {
					dummyDestroy1();
				}
			};

			const app = new App({
				components: [DummyComponent1],
			});

			app.run(rootElement);
			await calls();
			child.removeChild(component);
			rootElement.appendChild(component);
			await calls();

			expect(dummyDestroy1).toBeCalledTimes(0);
		});
	});

	it('should throw error when matched two components for single node', async () => {
		asyncHelper(async calls => {
			const rootElement = document.createElement('div');
			const dummyComponent1Name = 'component-1';
			const dummyComponent2Name = 'component-2';

			rootElement.innerHTML = `
                <div
                    id="e1"
                    data-${dummyComponent1Name}
                    data-${dummyComponent2Name}
                    ></div>
            `;

			const dummyConstructor1 = jest.fn();
			const DummyComponent1 = class extends Component {
				constructor(...args: ComponentArgs) {
					super(...args);
					dummyConstructor1(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent1Name;
				}
			};

			const dummyConstructor2 = jest.fn();
			const DummyComponent2 = class extends Component {
				constructor(...args: ComponentArgs) {
					super(...args);
					dummyConstructor2(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent2Name;
				}
			};

			const app = new App({
				components: [DummyComponent1, DummyComponent2],
			});

			let error: ComponentError = {} as ComponentError;

			try {
				app.run(rootElement);

				await calls();
			} catch (e: any) {
				error = e;
			}

			expect(error).toBeInstanceOf(ComponentError);
			expect(error.message).toBe(
				'Component instance has already been initialized for this element'
			);
			expect(error.element).toBe(rootElement.querySelector('#e1'));
			expect(error.component).toBeInstanceOf(DummyComponent1);
		});
	});

	it('should destroy component instnces when destroying the whole app', async () => {
		asyncHelper(async calls => {
			const rootElement = document.createElement('div');
			const dummyComponent1Name = 'component-1';
			const dummyComponent2Name = 'component-2';

			rootElement.innerHTML = `
                <${dummyComponent1Name} id="e1"></${dummyComponent1Name}>
                <${dummyComponent2Name} id="e2"></${dummyComponent2Name}>
            `;

			const dummyDestructor1 = jest.fn();
			const DummyComponent1 = class extends Component {
				destroy(...args: any[]) {
					super.destroy();
					dummyDestructor1(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent1Name;
				}
			};

			const dummyDestructor2 = jest.fn();
			const DummyComponent2 = class extends Component {
				destroy(...args: any[]) {
					super.destroy();
					dummyDestructor2(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent2Name;
				}
			};
			const dummyComponent2Options = { option1: true };

			const app = new App({
				components: [DummyComponent1, [DummyComponent2, dummyComponent2Options]],
			});

			app.run(rootElement);

			await calls();

			app.destroy();

			expect(dummyDestructor1).toBeCalledTimes(1);
			expect(dummyDestructor2).toBeCalledTimes(1);
		});
	});

	it('should initialize components for nodes added to dom when ovee:dom:updated event called', async () => {
		await asyncHelper(async (calls, wipe) => {
			const rootElement = document.createElement('div');
			const dummyComponent1Name = 'component-1';

			const dummyConstructor1 = jest.fn();
			const DummyComponent1 = class extends Component {
				constructor(...args: ComponentArgs) {
					super(...args);
					dummyConstructor1(...args);
				}

				static register() {}

				static getName() {
					return dummyComponent1Name;
				}
			};

			const app = new App({
				config: {
					global: window,
					document: document,
				},
				components: [DummyComponent1],
			});

			app.run(rootElement);

			await calls();

			expect(dummyConstructor1).toBeCalledTimes(0);

			wipe();

			const newComponent = document.createElement('div');

			newComponent.setAttribute(`data-${dummyComponent1Name}`, 'true');
			rootElement.appendChild(newComponent);
			rootElement.dispatchEvent(new Event('ovee:dom:updated'));

			await calls();

			expect(dummyConstructor1).toBeCalledTimes(1);
			expect(dummyConstructor1.mock.calls[0][0]).toBe(newComponent);
			expect(dummyConstructor1.mock.calls[0][1]).toBe(app);
			expect(dummyConstructor1.mock.calls[0][2]).toEqual({});
		});
	});

	it('should subscribe to events using $on method and EventDelegate', async () => {
		const app = new App();
		const event = 'event';
		const callback = () => {};
		const target = document.createElement('div');
		const onSpy = jest.spyOn(EventDelegate.prototype, 'on');

		app.$on(event, callback);
		app.$on(event, target, callback);

		await flushPromises();

		expect(onSpy).toHaveBeenCalledTimes(2);
		expect(onSpy.mock.calls[0][0]).toEqual(event);
		expect(onSpy.mock.calls[0][1]).toEqual(callback);
		expect(onSpy.mock.calls[1]).toEqual([event, target, callback]);
	});

	it('should unsubscribe to events using $off method and EventDelegate', async () => {
		const app = new App();
		const event = 'event';
		const callback = () => {};
		const target = document.createElement('div');
		const offSpy = jest.spyOn(EventDelegate.prototype, 'off');

		app.$off(event, callback);
		app.$off(event, target, callback);

		await flushPromises();

		expect(offSpy).toHaveBeenCalledTimes(2);
		expect(offSpy.mock.calls[0][0]).toEqual(event);
		expect(offSpy.mock.calls[0][1]).toEqual(callback);
		expect(offSpy.mock.calls[1]).toEqual([event, target, callback]);
	});

	it('should unsubscribe to events using $emit method and EventDelegate', async () => {
		const app = new App();
		const EVENT = 'event';
		const DETAILS = 20;
		const emitSpy = jest.spyOn(EventDelegate.prototype, 'emit');

		app.$emit(EVENT);
		app.$emit(EVENT, DETAILS);

		await flushPromises();

		expect(emitSpy).toHaveBeenCalledTimes(2);
		expect(emitSpy.mock.calls[0][0]).toEqual(EVENT);
		expect(emitSpy.mock.calls[1]).toEqual([EVENT, DETAILS]);
	});
});

type ComponentArgs = [Element, App];
