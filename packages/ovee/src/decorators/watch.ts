import { WithReactiveProxy } from 'src/core/types';
import { WatcherCallback } from 'src/reactive/ReactiveProxy';
import makeReactive from 'src/reactive/makeReactive';
import instanceDecoratorDestructor from 'src/utils/instanceDecoratorDestructor';
import instanceDecoratorFactory from 'src/utils/instanceDecoratorFactory';

export interface WatchOptions {
    immediate?: boolean;
}

export default instanceDecoratorFactory(
    (instance: WithReactiveProxy, methodName, path: string, options: WatchOptions = {}) => {
        const method: WatcherCallback<any> = (instance as any)[methodName];

        if (typeof (method) !== 'function') {
            console.error('Watch decorator should be only applied to a function');
        } else if (!path) {
            console.error('Path name must be provided for watch decorator');
        } else {
            const reactiveProxy = makeReactive(instance);

            reactiveProxy.watch(path, method.bind(instance));

            if (options.immediate === true) {
                method.apply(instance, [(instance as any)[path], undefined, path]);
            }

            instanceDecoratorDestructor(instance, () => {
                reactiveProxy.destroy();
            });
        }
    }
);
