import App from 'src/core/App';
import Module, { ModuleOptions } from 'src/core/Module';

jest.mock('../../../src/core/App');

function createModule<Opt extends ModuleOptions>(app: App, options?: Opt): Module<Opt> {
    return new (class extends Module<Opt> {
        init() {}
    })(app, options ?? {});
}

describe('Module class', () => {
    it('should set options property', () => {
        const app = new App();
        const options = {
            lorem: 'ipsum'
        };
        const module = createModule(app, options);

        expect(module.options).toBeInstanceOf(Object);
        expect(module.options.lorem).toBe(options.lorem);
    });

    it('should handle no options passed with an empty object', () => {
        const app = new App();
        const module = createModule(app);

        expect(module.options).toBeInstanceOf(Object);
        expect(Object.keys(module.options).length).toBe(0);
    });

    it('should set app property', () => {
        const app = new App();
        const options = {};
        const module = createModule(app, options);

        expect(module.$app).toBeInstanceOf(App);
        expect(module.$app).toBe(app);
    });

    it('should throw error if getName static method is not implemented', () => {
        expect(() => {
            Module.getName();
        }).toThrow('Module class needs to implement static getName() method');
    });
});
