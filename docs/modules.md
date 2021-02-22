# Modules

[[toc]]

## What is a Module

When developing a website or a web app, sometimes you'll find a need to structure some parts of your code outside of a component. There are countless of use cases and often you'll just create a separate `.js` file somewhere in structure of your project and then will import functions or classes from it. But sometimes you'd want to hook deeper into the app lifecycle and treat this part of code more like a plugin for the framework. In such case, Ovee Modules should do the job for you.

A Ovee Module is a class that inherits from `Module` and can be registered with `app.use()` method of `App` object (or with `modules` property of app config object). It will get auto initialized and always a single instance of the module will live during the app lifetime.

## Declaring and Registering

A module has to extend base `Module` class. It should declare `init()` method that will be called to boot your module and a `static getName()` method that returns a name of your module. It's important as you will then use this exact name to access module's instance from other parts of the app.

```js
import { Module } from 'ovee.js';
import DummyLibrary from 'dummy-library';

export default class extends Module {
    init() {
        this.dummyLibrary = new DummyLibrary(this.options);
    }

    dummyMethod() {
        return this.dummyLibrary.someDummyCall();
    }

    destroy() {
        this.dummyLibrary.destroy();
    }

    static getName(): string {
        return 'DummyModule';
    }
}
```

To register a module, you can either call `app.use(ModuleClass, moduleOptions)` or pass `modules` object to `App` constructor. If you optionally pass options object, it will be available as `options` within `Module` instance. You can use options object to pass configuration to the module, which can help with making your modules more reusable.

```js

const app = new App({
    modules: [
        FirstModule,
        [SecondModule, {
            // options
        }]
    ]
});

app.use(ThirdModule, {
    // options
});

```

## Module Lifecycle
A new instance of the module is made when you run `app.run()`, before initializing components. Only a single instance of a module exists during the runtime. Modules get destroyed, if you explicitly call `app.destroy()` method. Otherwise, they live as long as the app session exists.

## Accessing from Components
To access a module's instance, you can use `getModule()` method of `App` instance by passing module name as a parameter. If you want to do that from within a component, you can call `this.$app.getModule('ModuleName')`. 

## Extending App instance

Sometimes you'll want to extend your app instance with additional methods or properties. You can do that by accessing `this.$app` from module's `init()` method. How you execute that is up to you, although we suggest to be caucius to avoid name clashing. If you are using TypeScript, follow [Overriding App class](typescript#overriding-app-class) section of the docs.

## Ready-made Modules
To keep things tide, Ovee doesn't come with any modules by itself. Yet, we ship some official, ready-made modules that would help your workflow as a separate packages. You will find more about that in [Addons](addons) section of the documentation.