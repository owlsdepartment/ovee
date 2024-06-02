# Components

Now we can get to the *crème de la crème* of Ovee: __components__! The reusable building blocks of your beautiful web page, that will structure your code and spark some life in your HTML. There's a lot to cover in this chapter, so without wasting time, let's get started!

## Defining a component

Similarly to [Modules](./modules.md), we start with a `defineComponent` method, which accepts a __setup function__, inside which you can access the current component's context.

```ts
import { defineComponent } from 'ovee.js'

export const MyComponent = defineComponent((element, {
    app, on, off, emit, name, options
}) => {
    console.log('hi from component!')
})
```

And just register it in the app

```ts
import { MyComponent } from './MyComponent'

createApp()
    .component(MyComponent)
```

The setup function is called with two arguments:
 - HTML Element on which the component is connected to
 - component's context, which will be explained later on

::: tip
Unlike modules, the component's setup function is called when the component's instance is created, so when a proper HTML tag or data attribute is used, not when it's registered in the app.
:::

::: warning Async setup
Setup function can be defined as `async` but there are caveats, which are explained in the [Asynchronous setup](#async-setup) section
:::

## Using a component

Once our app is aware, that `MyComponent` exists, we can use it in HTML in two possible ways: as an element or data attribute.

```html
<!-- data attribute -->
<div data-my-component></div>

<!-- HTML Element -->
<my-component />
```

::: details
You don't need to call anything or something like that. Ovee detects new and existing patterns that match and manages these components by itself
:::

The only difference between these two is that in the second one we will use our custom HTML element, and not builtin `div` or any other tag.

There can be also multiple `data-attribute` components on one element, but only one custom element, so you can do something like this:

```html
<!-- multiple components on one div -->
<div data-my-component data-other-component></div>
<!-- multiple components on custom element -->
<my-component data-other-component />
```

::: warning
Remember, that even if multiple components sharing one element __ARE POSSIBLE__ and they will both run, their code can cause conflicts between each other if, for example, they both modify inner HTML.
:::

## Lifecycle hooks

Our components can now be registered and used inside HTML. But DOM can change, and elements can be destroyed, created, and updated. The same goes for our components. To integrate with this flow, Ovee components have lifecycle hooks - built-in functions that let you register callbacks for specific component events.

The component's lifecycle can be presented like so:
 - `setup` - setup function is being called, with element already existing
 - `beforeMount` - synchronous hook, called instantly after `setup` finishes
 - `mounted` - when we processed our component. It's fully mounted and ready
 - `unmounted` - called when the component is being destroyed, mostly when an element is being removed from DOM. Good place to clean up some stuff

For the last three, we have special builtins, with prefixes `on...`. We can pass them a callback, so we react to the component's state change. Let's see the example

```ts
export const MyComponent = defineComponent(() => {
    onBeforeMount(() => { /* ... */ }) // [!code focus]
    onMounted(() => { /* ... */ }) // [!code focus]
    onUnmounted(() => { /* ... */ }) // [!code focus]
})
```

## Component context

It's time to address a second setup parameter: __component context__. It's an object, containing a few important things:

 - `app` - our app instance
 - `on` - function for adding event handlers
 - `off` - function for removing event handlers
 - `emit` - function for emitting events
 - `name` - component's name
 - `options` - configuration object used, when registering component

Functions associated with event handling will be discussed in [the next chapter](./event-handling.md). `app` instance is rarely needed in components, so we won't talk about it here, but you can find a reference to it in the API section.

We also have `options`, which similarly to `modules`, are a simple way to globally pass configuration object for all instances of a specific component. To set component options, all you need to do is add them when registering to the app:

::: code-group
```ts [app.ts]
createApp()
    .component(MyComponent, { event: 'resize' })
    // alternatively with useMany
    .useMany({
        MyComponent: [MyComponent, { event: 'resize' }]
    })
```

```ts [MyComponent.ts]
export const MyComponent = defineComponent((element, { options }) => {
    const event = options.event

    // ...
})
```
:::

Providing default options is just a plain JS

```ts
export const MyComponent = defineComponent((element, { // [!code focus]
    options = { event: 'change' } // [!code focus]
}) => { // [!code focus]
    const event = options.event

    // ...
})
```

## Expose component internals

Every component can expose functions and variables to the outside world. It's a good way of communication in some special cases. Other components or modules can access exposed instances and control components, or send it's some data from the outside. Using TypeScript can even make it type-safe, but more on that later.

To expose things to the outside world, you need to return an object from the setup function. This object's methods and fields will be available outside. Simple example:

::: code-group
```ts [ChildComponent.ts]
export const ChildComponent = defineComponent(() => {
    let counter = 0

    function add() {
        counter++
    }

    function getCounter() {
        return counter
    }

    return {
        add,
        getCounter
    }
})
```

```ts [ParentComponent.ts]
export const ParentComponent = defineComponent(() => {
    // we will explain this line later on, but for now all we need to now,
    // is that it returns ChildComponent instance
    const child = useQueryComponent(ChildComponent)

    child.getCounter() // 0
    child.add()
    child.getCounter() // 1
})
```
:::

## JSX Template

Components can render their HTML, by using `useTemplate` helper and JSX templating. You can find more on that topic in the [JSX](./jsx.md) chapter.

## Asynchronous setup {#async-setup}

Nothing stops you from making your setup function `async`, but you need to be aware, that you need to call all of your hooks and composable functions, like `onMounted`, __BEFORE__ you `await` your promise

```ts{10}
export const MyComponent = defineComponent(async () => {
    onMounted(() => {
        // ...
    })

    onUnmounted(() => {
        // ...
    })

    const data = await fetch(`https://api.fallback.com/awesome/data`)
})
```
