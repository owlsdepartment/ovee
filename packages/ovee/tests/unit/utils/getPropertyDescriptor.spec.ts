import { getPropertyDescriptor } from 'src/utils';

describe('getPropertyDescriptor', () => {
	class Base {
		field = 'test';

		method() {}
	}

	it('returns proper descriptor for flat object', () => {
		const b = new Base();

		expect(getPropertyDescriptor(b, 'field')).toEqual(Reflect.getOwnPropertyDescriptor(b, 'field'));
		expect(getPropertyDescriptor(b, 'method')).toEqual(
			Reflect.getOwnPropertyDescriptor(Reflect.getPrototypeOf(b)!, 'method')
		);
		expect(getPropertyDescriptor(b, 'non-existing')).toEqual(undefined);
	});

	it('returns proper descriptor for nested prototype chain', () => {
		class Extend extends Base {}

		const e = new Extend();
		const methodDescriptor = Reflect.getOwnPropertyDescriptor(
			Reflect.getPrototypeOf(Reflect.getPrototypeOf(e)!)!,
			'method'
		);

		console.log(Reflect.getOwnPropertyDescriptor(e, 'method'));
		expect(getPropertyDescriptor(e, 'field')).toEqual(Reflect.getOwnPropertyDescriptor(e, 'field'));
		expect(getPropertyDescriptor(e, 'method')).toEqual(methodDescriptor);
		expect(getPropertyDescriptor(e, 'non-existing')).toEqual(undefined);
	});
});
