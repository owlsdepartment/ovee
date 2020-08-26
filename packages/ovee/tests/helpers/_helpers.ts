declare namespace NodeJS {
    interface Global {
        asyncHelper: (
            runFn: (calls: () => Promise<any[]>, wipe: () => void) => Promise<any>
        ) => Promise<void>;

        spyConsole: (method: 'log' | 'warning' | 'error') => { console: jest.SpyInstance };

        flushPromises: () => Promise<NodeJS.Immediate>;
    }
}

global.asyncHelper = async (runFn) => {
    const orgSetTimeout = global.setTimeout;
    const orgRequestAnimationFrame = window.requestAnimationFrame;
    const asyncFn: ((...args: any[]) => Promise<any>)[] = [];
    const getStubFn: any = () => jest.fn(
        // eslint-disable-next-line @typescript-eslint/ban-types
        (c: Function) => asyncFn.push(c())
    );

    global.setTimeout = getStubFn();
    window.requestAnimationFrame = getStubFn();

    const result = await runFn(
        () => Promise.all(asyncFn),
        () => { asyncFn.splice(0, asyncFn.length); }
    );

    global.setTimeout = orgSetTimeout;
    window.requestAnimationFrame = orgRequestAnimationFrame;

    return result;
};

global.spyConsole = (method) => {
    const spy: { console: jest.SpyInstance } = {} as any;

    beforeEach(() => {
        spy.console = jest.spyOn(console, method as any).mockImplementation(() => {});
    });

    afterEach(() => {
        spy.console.mockRestore();
    });

    return spy;
};

global.flushPromises = () => new Promise(setImmediate);

declare const asyncHelper: typeof global.asyncHelper;
declare const spyConsole: typeof global.spyConsole;
declare const flushPromises: typeof global.flushPromises;
