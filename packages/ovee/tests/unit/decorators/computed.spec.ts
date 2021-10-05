import Component from 'src/core/Component';
import { computed } from 'src/decorators';
import { makeComputed, ref } from 'src/reactive/vue';
import { createComponent, createLoggerRegExp } from 'tests/helpers';

jest.mock('src/reactive/vue', () => {
	const originalModule = jest.requireActual('src/reactive/vue');

	return {
		__esModule: true,
		...originalModule,
		makeComputed: jest.fn(originalModule.makeComputed),
	};
});

describe('@computed decorator', () => {
	const errorSpy = spyConsole('error');

	beforeEach(() => {
		(makeComputed as jest.Mock).mockClear();
	});

	it(`can only be applied to getter`, async () => {
		const testEerrorMsg = createLoggerRegExp('@computed');
		class Test extends Component {
			@computed() field: any;
			@computed()
			set setter(v: any) {}
			@computed()
			get getter() {
				return '';
			}
			@computed()
			method() {}
		}

		createComponent(Test);

		expect(errorSpy.console).toBeCalledTimes(3);
		expect(errorSpy.console.mock.calls[0][0]).toMatch(testEerrorMsg);
		expect(errorSpy.console.mock.calls[1][0]).toMatch(testEerrorMsg);
		expect(errorSpy.console.mock.calls[2][0]).toMatch(testEerrorMsg);
	});

	it(`uses 'makeComputed' under the hood`, async () => {
		class Test extends Component {
			@computed()
			get getter() {
				return '';
			}
		}

		createComponent(Test);

		expect(makeComputed).toBeCalledTimes(1);
	});

	it('reflects changes made to reactive variables used inside computed', () => {
		const testRef = ref(false);
		class Test extends Component {
			@computed()
			get testGetter() {
				return `${testRef.value}`;
			}
		}

		const test = createComponent(Test);

		expect(test.testGetter).toBe(`false`);

		testRef.value = true;

		expect(test.testGetter).toBe(`true`);
	});

	it('caches last getter result', async () => {
		const testRef = ref(false);
		const spyGetter = jest.fn();
		class Test extends Component {
			@computed()
			get testGetter() {
				spyGetter();
				return `${testRef.value}`;
			}
		}

		const test = createComponent(Test);

		test.testGetter;
		test.testGetter;

		expect(spyGetter).toBeCalledTimes(1);

		testRef.value = true;
		await flushPromises();
		test.testGetter;
		test.testGetter;

		expect(spyGetter).toBeCalledTimes(2);
	});
});
