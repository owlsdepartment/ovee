import InstanceDecorators from 'src/core/InstanceDecorators';
import {
	DESTROY_DECORATORS,
	INITIALIZE_DECORATORS,
	INSTANCE_DECORATORS,
	INSTANCE_DECORATORS_DESTRUCTORS,
} from 'src/core/protectedFields';

describe('InstanceDecorators class', () => {
	it(`initializes decorator for each class in prototype chain,
        that inherits from it, when 'INITIALIZE_DECORATORS' was called`, () => {
		const aDecorator = jest.fn();
		const bDecorator = jest.fn();

		class A extends InstanceDecorators {
			static [INSTANCE_DECORATORS] = [aDecorator];
		}
		class B extends A {
			static [INSTANCE_DECORATORS] = [bDecorator];
		}

		const b = new B();
		b[INITIALIZE_DECORATORS]();

		expect(bDecorator).toBeCalledTimes(1);
		expect(aDecorator).toBeCalledTimes(1);
	});

	it("passes 'this' as a first argument of decorator initializer", () => {
		const aDecorator = jest.fn();
		const bDecorator = jest.fn();

		class A extends InstanceDecorators {
			static [INSTANCE_DECORATORS] = [aDecorator];
		}
		class B extends A {
			static [INSTANCE_DECORATORS] = [bDecorator];
		}

		const b = new B();
		b[INITIALIZE_DECORATORS]();

		expect(bDecorator.mock.calls[0][0]).toBe(b);
		expect(aDecorator.mock.calls[0][0]).toBe(b);
	});

	it(`calls destructor decorator for each class in prototype chain,
        that inherits from it, when 'DESTROY_DECORATORS' was called`, () => {
		const aDecorator = jest.fn();
		const bDecorator = jest.fn();

		class A extends InstanceDecorators {
			static [INSTANCE_DECORATORS_DESTRUCTORS] = [aDecorator];
		}
		class B extends A {
			static [INSTANCE_DECORATORS_DESTRUCTORS] = [bDecorator];
		}

		const b = new B();
		b[DESTROY_DECORATORS]();

		expect(bDecorator).toBeCalledTimes(1);
		expect(aDecorator).toBeCalledTimes(1);
	});

	it("passes 'this' as a first argument of decorator destructor", () => {
		const aDecorator = jest.fn();
		const bDecorator = jest.fn();

		class A extends InstanceDecorators {
			static [INSTANCE_DECORATORS_DESTRUCTORS] = [aDecorator];
		}
		class B extends A {
			static [INSTANCE_DECORATORS_DESTRUCTORS] = [bDecorator];
		}

		const b = new B();
		b[DESTROY_DECORATORS]();

		expect(bDecorator.mock.calls[0][0]).toBe(b);
		expect(aDecorator.mock.calls[0][0]).toBe(b);
	});
});
