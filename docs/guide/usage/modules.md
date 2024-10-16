# Modules

So powerful and yes so simple - plain functions that start with the app itself. Those are Ovee.js modules.

They can extend app instance, listen for DOM events, integrate external libraries, share single instance across the whole app... there are little to none restrictions with them. So let's dive deep into how to write them.

## Defining a module

To define your module you need `defineModule` helper. Makes sense, right?

```ts
import { defineModule } from 'ovee.js'

export const MyModule = defineModule(({ app, options }) => {
    console.log(`I'm inside the module!`)
})
```

Then we need to register it in app

```ts
import { MyModule } from './MyModule'

createApp()
    .use(MyModule)
```

`defineModule` accepts a function, we call a __setup function__. It also receives an object with `app` instance and module `options`, that the module was registered with. But more on those two later.

Setup function runs instantly when module would be created. That means the `console.log` in our example, will run really early... and by that I mean in the exact moment this module was registered in the app, before `run()` was called!

::: warning Async setup
Setup function can be defined as `async` but there are caveats, which are explained in [Asynchronous setup](#async-setup) section
:::

## Lifecycle hooks

What if we want to run some code when whole app is already runing and all modules/components are registered? Than we can use special `onInit` lifecycle hook, that will let you register a function to run on a module intialization!

```ts
export const MyModule = defineModule(() => {
    console.log(`I'm inside the module!`)

    onInit(() => { // [!code focus]
        console.log('This module was initialized') // [!code focus]
    }) // [!code focus]
})
```

So if we are able to know, when module is initialized, we also can detect when it's being destroyed with `onDestroy`. It's useful when you need to clean up some timers or event listeners, like in the example below.

```ts
export const MyModule = defineModule(() => {
    const timeoutId = setInterval(() => { // [!code focus]
        // we do some checkup every 1s...
    }, 1000) // [!code focus]

    onDestroy(() => { // [!code focus]
        clearInterval(timeoutId) // [!code focus]
    }) // [!code focus]
})
```

Tho to be fair, situation when module is being destroyed before app itself and user is still on the page is super rare and rarely happens, but if it does, we can handle that.

::: info
Both of these lifecycle functions run only once for each module instance
:::

## Module instance

When declaring a module, you can optionally return an object. If you do that, it will be saved as a module's instance and exposed for rest of the app. This mechanism allows you to return a methods or values, for module control and data sharing.

Let's present a simple counter example

```ts
export const MyModule = defineModule(() => {
    let value = 0

    function increase() {
        value++
    }

    function decrease() {
        value--
    }

    return {
        increase,
        decrease,
        getValue: () => value
    }
})
```

Then in some other place, like module or a component, you can retrieve module instance and use it with `useModule` composable

```ts
export const OtherModule = defineModule(() => {
    const myModule = useModule(MyModule)

    console.log(myModule.getValue())
    myModule.increase()
    myModule.decrease()
    console.log(myModule.getValue())
})
```

## App instance

App being the core structure of Ovee instance, holds all modules and components, as well as some useful helpers. Modules setup function will receive it as a first argumet, as shown in the first example. There is also an alternative way of getting it, with `useApp` builtin.

```ts{2}
export const MyModule = defineModule(() => {
    const app = useApp()
})
```

::: tip
In most cases, it's better to get an `app` from `setup` first argument, as it's simpler and easier. But `useApp` can be useful when writing reusable blocks of code
:::

One of common use cases to utilize app, it for the event handling. App instance has three methods `$on`, `$off` and `$emit`. We will dive deeper into them in later chapters, but for now you will see an example using them.

```ts
export const MyModule = defineModule(({ app }) => {
    let windowHeight = window.innerHeight

    app.$on('resize', () => {
        windowHeight = window.innerHeight
    }, { target: window })

    app.$on('ovee:fetched', onDataFetched)

    onInit(() => {
        app.$emit('my-module:initialized')
    })

    onDestroy(() => {
        app.$off('ovee:fetched', onDataFetched)
    })

    function onDataFetched() {
        // ...
    }
})
```

## Options

Whne you wrote your module once, maybe you could reuse it in multiple projects? But what if there are project specific API calls inside it, with specific URLs and API keys. We need a way to configure our modules on a project basis. That's when our `options` come in play.

When you register a module, you can optionally pass an options object

::: code-group

```ts [app.ts]
createApp()
    .use(MyModule, { url: 'https://api.fines.com' })
    // alternatively with useMany
    .useMany({
        MyModule: [MyModule, { url: 'https://api.fines.com' }]
    })
```

```ts [MyModule.ts]
export const MyModule = defineModule(({ options }) => {
    const baseUrl = options.url

    fetch(`${baseUrl}/awesome/data`).then(() => /* ... */)
})
```
:::

Providing default options is just a plain JS

```ts
export const MyModule = defineModule(({ // [!code focus]
    options = { url: 'https://api.fallback.com' } // [!code focus]
}) => { // [!code focus]
    const baseUrl = options.url

    fetch(`${baseUrl}/awesome/data`).then(() => /* ... */)
})
```

But it probably would be better to extract a defulat value to a constant few lines higher.

## Asynchronous setup {#async-setup}

Nothing stops you from making your setup function `async`, but you need to be aware, that you need to call all of your hooks and composable functions, like `useApp`, __BEFORE__ you `await` your promise

```ts{12}
export const MyModule = defineModule(async () => {
    const app = useApp()

    onInit(() => {
        // ...
    })

    onDestroy(() => {
        // ...
    })

    const data = await fetch(`https://api.fallback.com/awesome/data`)
})
```
