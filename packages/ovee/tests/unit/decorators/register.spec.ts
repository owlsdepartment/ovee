import register from 'src/decorators/register';

describe('@register decorator', () => {
    const consoleSpy = spyConsole('error');

    it('logs error when name wan\'t provided', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        register()(class {});

        expect(consoleSpy.console).toHaveBeenCalledTimes(1);
        expect(consoleSpy.console.mock.calls[0][0]).toBe('Name must be provided for component decorator');
    });

    it('logs error when used on something else then class', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        register('name')({});

        expect(consoleSpy.console).toHaveBeenCalledTimes(1);
        expect(consoleSpy.console.mock.calls[0][0]).toBe('Decorator works only for classes');
    });

    it('logs error when passed name does not have at least two words', () => {
        class Test {}
        register('name')(Test);

        expect(consoleSpy.console).toHaveBeenCalledTimes(1);
        expect(consoleSpy.console.mock.calls[0][0]).toBe('Component name must consist of at least two words');
    });

    it('adds static function getName that returns string', () => {
        class Test {}
        register('componentName')(Test);

        expect(Test).toHaveProperty('getName');
        expect((Test as any).getName).toBeInstanceOf(Function);
        expect((Test as any).getName()).toBe('component-name');
    });

    it('converts passed name to kebabCase', () => {
        class Test {}
        register('testName')(Test);

        expect((Test as any).getName()).toBe('test-name');
    });
});
