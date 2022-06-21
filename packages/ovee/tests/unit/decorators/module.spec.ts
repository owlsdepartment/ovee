import App from 'src/core/App';
import Component from 'src/core/Component';
import Module from 'src/core/Module';
import { module } from 'src/decorators';
import { createComponent, createLoggerRegExp } from 'tests/helpers';

describe('@module decorator', () => {
	const errorSpy = spyConsole('error');

	it('can only be applied to class field', () => {
		const testEerrorMsg = createLoggerRegExp('@module');
		class Test extends Component {
			@module('test')
			set setter(v: any) {}

			@module('test')
			get getter() {
				return '';
			}

			@module('test')
			method() {}
		}

		createComponent(Test);

		expect(errorSpy.console).toBeCalledTimes(3);
		expect(errorSpy.console.mock.calls[0][0]).toMatch(testEerrorMsg);
		expect(errorSpy.console.mock.calls[1][0]).toMatch(testEerrorMsg);
		expect(errorSpy.console.mock.calls[2][0]).toMatch(testEerrorMsg);
	});

	it('sets retrieved module on decorated field', () => {
		class TestModule extends Module {
			init(): void {}

			static getName(): string {
				return 'Test';
			}
		}
		class Test extends Component {
			@module('Test')
			module: any;

			@module(TestModule)
			module2: any;
		}
		const app = new App({ modules: [TestModule] });

		const instance = createComponent(Test, { app });

		expect(instance.module).toBeInstanceOf(TestModule);
		expect(instance.module2).toBeInstanceOf(TestModule);
	});
});
