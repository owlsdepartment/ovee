import { WithReactiveProxy } from 'src/core/types';
import makeReactive from 'src/reactive/makeReactive';
import instanceDecoratorDestructor from 'src/utils/instanceDecoratorDestructor';
import instanceDecoratorFactory from 'src/utils/instanceDecoratorFactory';

export default instanceDecoratorFactory((instance: WithReactiveProxy, propName) => {
    if (typeof (instance as any)[propName] === 'function') {
        console.error('Reactive decorator should be only applied to a property');
    } else {
        const reactiveProxy = makeReactive(instance);

        reactiveProxy.enableFor(propName);

        instanceDecoratorDestructor(instance, () => {
            reactiveProxy.destroy();
        });
    }
});
