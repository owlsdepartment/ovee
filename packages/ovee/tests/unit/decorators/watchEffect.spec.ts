import Component from 'src/core/Component';
import * as protectedFields from 'src/core/protectedFields';
import { watchEffect } from 'src/decorators';
import { doWatchEffect, ReactiveProxy } from 'src/reactive';
import { createComponent, createLoggerRegExp } from 'tests/helpers';

jest.mock('src/reactive', () => {
	const originalModule = jest.requireActual('src/reactive');

	return {
		__esModule: true,
		...originalModule,
		doWatchEffect: jest.fn((...args: any[]) => {
			return jest.fn(originalModule.doWatchEffect(...args));
		}),
	};
});

describe('@watchEffect decorator', () => {
	const errorSpy = spyConsole('error');

	beforeEach(() => {
		(doWatchEffect as jest.Mock).mockClear();
	});

	it('can only be applied to function', async () => {
		class Test extends Component {
			@watchEffect() field: any;

			@watchEffect()
			get getter() {
				return '';
			}

			@watchEffect()
			set setter(v: any) {}

			@watchEffect()
			method() {}
		}

		createComponent(Test);

		expect(errorSpy.console).toBeCalledTimes(3);
		expect(errorSpy.console.mock.calls[0][0]).toMatch(createLoggerRegExp('@watchEffect'));
		expect(errorSpy.console.mock.calls[1][0]).toMatch(createLoggerRegExp('@watchEffect'));
		expect(errorSpy.console.mock.calls[2][0]).toMatch(createLoggerRegExp('@watchEffect'));
	});

	it('ensures that target is reactive', () => {
		class Test extends Component {
			@watchEffect()
			method() {}
		}

		const test = createComponent(Test);

		expect(test[protectedFields.REACTIVE_PROXY]).toBeInstanceOf(ReactiveProxy);
	});

	it(`passes options to 'doWatchEffect'`, () => {
		const options = {};
		class Test extends Component {
			@watchEffect(options)
			method() {}
		}

		createComponent(Test);

		expect((doWatchEffect as jest.Mock).mock.calls[0][0]).toEqual(expect.any(Function));
		expect((doWatchEffect as jest.Mock).mock.calls[0][1]).toBe(options);
	});

	it(`binds method to 'this' instance`, () => {
		const methodStub = jest.fn();
		class Test extends Component {
			a = {};

			@watchEffect()
			method() {
				methodStub(this.a);
			}
		}

		const test = createComponent(Test);

		expect(methodStub.mock.calls[0][0]).toBe(test.a);
	});

	it('destroyes watcher when destructor is called', () => {
		class Test extends Component {
			@watchEffect()
			method() {}
		}

		const test = createComponent(Test);

		test.$destroy();

		expect((doWatchEffect as jest.Mock).mock.results[0].value).toBeCalledTimes(1);
	});
});
