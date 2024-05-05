# App

## Initialization

It's a heart of your Ovee.js application. App instance controls your modules and components, making all the magic for you. And you can create with few simple lines using `createApp` helper function.

```ts
import { createApp } from 'ovee.js'

// we search for root element of your application, it can be any HTML element, also <body> 
const root = document.getElementById('root')
// now we just create an app...
const app = createApp()
// ...and run it with out root!
app.run(root)
```

All of this can be written in one/two lines

```ts
import { createApp } from 'ovee.js'

createApp()
    .run(document.getElementById('root'))
```

## Configuration

Every application or web page is different, so we need a way to customize ours and make it fit our needs perfectly.

To do that, all you need to do is pass a config object as a first parameter of `createApp` function.

```ts{4-5}
import { createApp } from 'ovee.js'

createApp({
    name: 'My awesome app!'
    baseUrl: 'https://my-awesome-app.com'
})
    .run(document.getElementById('root'))
```

By default, this object accepts only 3 optional keys:
 - `document` - a HTML document instance, could be useful for testing purposes, but in most cases you don't need to pass it, as it's equal to `window.document`
 - `namespace` - used for components default CSS Class and as a root events prefix. It's recomended not to change it
 - `productionTip` - should productionTips be displayed. By default, it tries to detect if `NODE_ENV` environment variable not equals to `PRODUCTION`

These are internal config options, but of course you can add yuor own and they will be accessible later on in modules and components.

::: tip TypeScript
To make sure your custom configs are properly visible in other parts of the application, you can extend default interface with new properties.

```ts
declare module 'ovee.js' {
    export interface AppConfig {
        name: string
        baseUrl: string
    }
}
```
:::

## Module registration

We already know the basic configuration, but it's just a simple object. What if we want to add a global behviour or maybe some library integration, that is fully conected to Ovee.js lifecycle.

That's when modules come in. We will learn about them more in the next chapter, but for now let's focus on adding them to your application. We can do that with chainable method: `use`.

```ts{5-6}
import { createApp } from 'ovee.js'
import { AloneModule, ConfigurableModule } from './modules'

createApp()
    .use('AloneModule', AloneModule) // [!code focus]
    .use('ConfigurableModule', ConfigurableModule, { isCool: true }) // [!code focus]
    .run(document.getElementById('root'))
```

Method `use(...)` accepts module name as it's first argument, then module itself and lastly, an optional config object that the module will receive as it's parameter on initialization, so it can be configurable and reusable between multiple apps.

But it would be annoying to write every module in new line like that. Also, the file could get quite big and hard to manage. So there is a way to register multiple modules at once: `useMany`.

```ts
import { createApp } from 'ovee.js'
import { AloneModule, ConfigurableModule } from './modules'

createApp()
    .useMany({ // [!code focus]
        AloneModule: AloneModule, // [!code focus]
        // or using JS shorthand // [!code focus]
        AloneModule, // [!code focus]
        ConfigurableModule: [ConfigurableModule, { isCool: true }] // [!code focus]
    }) // [!code focus]
    .run(document.getElementById('root'))
```

::: tip
You can also accumulate all those modules in a single object and expose it via a seperate file. It's a good practice and seperates logic a little bit.

::: code-group
```ts [modules.ts]
export default {
    AloneModule,
    ConfigurableModule: [ConfigurableModule, { isCool: true }]
}
```

```ts [main.ts]
import modules from './modules'

createApp()
    .useMany(modules)
    .run(document.getElementById('root'))
```
:::

## Component registration

Same goes for components. To make them available in your app, they need to be registered and the process looks identical like with modules, but the methods are: `component` and `components`.

```ts{5-6}
import { createApp } from 'ovee.js'
import { MainView, SectionToggle } from './components'

createApp()
    .component('MainView', MainView) // [!code focus]
    .components('SectionToggle', SectionToggle, { duration: 0.4 }) // [!code focus]
    .run(document.getElementById('root'))
```

Multiple at once:

```ts
import { createApp } from 'ovee.js'
import { MainView, SectionToggle } from './components'

createApp()
    .useMany({ // [!code focus]
        MainView: MainView, // [!code focus]
        // or using JS shorthand // [!code focus]
        MainView, // [!code focus]
        SectionToggle: [SectionToggle, { duration: 0.4 }] // [!code focus]
    }) // [!code focus]
    .run(document.getElementById('root'))
```

::: tip
Just like modules, grouping them in a single file is a good practice

::: code-group
```ts [components.ts]
export default {
    MainView,
    SectionToggle: [SectionToggle, { duration: 0.4 }]
}
```

```ts [main.ts]
import components from './components'

createApp()
    .components(components)
    .run(document.getElementById('root'))
```
:::
