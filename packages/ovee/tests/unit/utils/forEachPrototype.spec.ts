import { forEachPrototype } from 'src/utils/forEachPrototype';

describe('forEachPrototype iterator', () => {
	it('calls callback for each inherited prototype of passed object', () => {
		const counter = jest.fn();

		class A {}
		class B extends A {}
		const bInstance = new B();

		forEachPrototype(bInstance, () => {
			counter();
		});

		expect(counter).toBeCalledTimes(2);
	});

	it('passes each prototype to callback', () => {
		const aFn = jest.fn();
		const bFn = jest.fn();

		class A {
			test() {
				aFn();
			}
		}
		class B extends A {
			test() {
				bFn();
			}
		}
		const bInstance = new B();

		forEachPrototype(bInstance, target => {
			target.test();
		});

		expect(aFn).toBeCalledTimes(1);
		expect(bFn).toBeCalledTimes(1);
	});

	it('stops before Object prototype is reached', () => {
		const base = {};
		const testFoo = jest.fn();

		forEachPrototype(base, () => {
			testFoo();
		});

		expect(testFoo).not.toBeCalled();

		class A {}

		forEachPrototype(new A(), () => {
			testFoo();
		});

		expect(testFoo).toBeCalledTimes(1);
	});

	it("returns immediately if 'null' or 'undefined' was an argument", () => {
		const callback = jest.fn();

		forEachPrototype(null, callback);
		forEachPrototype(undefined, callback);

		expect(callback).not.toBeCalled();
	});
});
