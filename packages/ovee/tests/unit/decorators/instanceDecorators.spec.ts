import Component from 'src/core/Component';
import * as protectedFields from 'src/core/protectedFields';
import { ClassConstructor } from 'src/utils';
import instanceDecoratorFactory from 'src/utils/instanceDecoratorFactory';
import { createComponent } from 'tests/helpers';

const getDecorators = (classDef: ClassConstructor<any>) => {
	return classDef.prototype.constructor[protectedFields.INSTANCE_DECORATORS] as Array<
		(...args: any[]) => any
	>;
};

describe('Instance Decorators System', () => {
	it("don't share decorators between extended components", async () => {
		const decoratorCb1 = jest.fn();
		const decoratorCb2 = jest.fn();

		const decorator1 = jest.fn(instanceDecoratorFactory(decoratorCb1)());
		const decorator2 = jest.fn(instanceDecoratorFactory(decoratorCb2)());

		class Base extends Component {
			@decorator1
			test: any;
		}
		class Extended extends Base {
			@decorator2
			test2: any;
		}

		expect(getDecorators(Base).length).toBe(1);
		expect(getDecorators(Extended).length).toBe(1);
		expect(getDecorators(Base)[0]).toBeInstanceOf(Function);
		expect(getDecorators(Extended)[0]).toBeInstanceOf(Function);
		expect(getDecorators(Base)[0]).not.toBe(getDecorators(Extended)[0]);

		const instance = createComponent(Extended);

		expect(decorator1).toHaveBeenCalledTimes(1);
		expect(decorator2).toHaveBeenCalledTimes(1);
		expect(decoratorCb1.mock.calls[0][0].instance).toBe(instance);
		expect(decoratorCb2.mock.calls[0][0].instance).toBe(instance);
	});

	it('makes decorators reusabel between multiple instances', () => {
		const decoratorCb = jest.fn();
		const decorator = jest.fn(instanceDecoratorFactory(decoratorCb)());

		class TestComponent extends Component {
			@decorator
			test: any;
		}

		const instance1 = createComponent(TestComponent);
		const instance2 = createComponent(TestComponent);

		expect(decorator).toHaveBeenCalledTimes(1);
		expect(decoratorCb).toHaveBeenCalledTimes(2);
		expect(decoratorCb.mock.calls[0][0].instance).toBe(instance1);
		expect(decoratorCb.mock.calls[1][0].instance).toBe(instance2);
	});
});
