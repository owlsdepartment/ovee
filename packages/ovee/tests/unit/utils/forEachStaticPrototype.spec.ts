import forEachStaticPrototype from 'src/utils/forEachStaticPrototype';

describe('forEachPrototype iterator', () => {
    it('calls callback for each inherited prototype of passed object', () => {
        const counter = jest.fn();

        class A {}
        class B extends A {}
        const bInstance = new B();

        forEachStaticPrototype(bInstance, () => {
            counter();
        });

        expect(counter).toBeCalledTimes(2);
    });

    it('passes static part of prototype to callback', () => {
        const aFn = jest.fn();
        const bFn = jest.fn();

        class A {
            static foo() {
                aFn();
            }
        }
        class B extends A {
            static foo() {
                bFn();
            }
        }

        forEachStaticPrototype<typeof A>(new B(), (ctor) => {
            ctor.foo();
        });

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
    });

    it('stops before Object prototype is reached', () => {
        const base = {};
        const testFoo = jest.fn();

        forEachStaticPrototype(base, () => {
            testFoo();
        });

        expect(testFoo).not.toBeCalled();

        class A {}

        forEachStaticPrototype(new A(), () => {
            testFoo();
        });

        expect(testFoo).toBeCalledTimes(1);
    });

    it('returns immediately if \'null\' or \'undefined\' was an argument', () => {
        const callback = jest.fn();

        forEachStaticPrototype(null, callback);
        forEachStaticPrototype(undefined, callback);

        expect(callback).not.toBeCalled();
    });
});
