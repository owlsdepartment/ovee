# Event Handling

When using Vanilla JS, you register event handlers using the [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) function and then, your callback is fired every time an element receives an event. There is a caveat tho: you need to manually remove those listeners when no longer needed and have a reference to the element you wish to listen on. Ovee tries to help you through on/off functions, that can do this for you, fully bound to the component's lifecycle.

## Using `on` in components

As you may remember from previous chapters, components expose the `on/off` methods through its context

```ts
export const MyComponent = defineComponent((element, { on, off }) => {
    // ...
})
```

Now to use it, we need to know its signature. It looks like this:

```ts
function on(events: string, callback: AnyFunction, options?: ListenerOptions): () => void;
```

In its base form, it accepts an event name and a callback function. So to listen for clicks in our awesome component:

```ts
export const MyComponent = defineComponent((element, { on }) => {
    on('click', () => { // [!code focus]
        // handle click! // [!code focus]
    }) // [!code focus]
})
```

And that's it! You don't need to clear this event. Once the component is destroyed, all listeners are removed as well. Notice that we didn't refer to the element. When you don't specify a target, `on` assumes that you want to connect it to the component's root. It also doesn't need any special context and can be called anytime, from any place possible.

The third argument, `ListenerOptions`, allows for some more customization. It is an object similar to options passed to `addEventListener` ([MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options)) with new fields:
 - `target?: string | EventTarget | EventTarget[]` - specify a target element. It can be a query selector string or element instance. It also accepts an array of elements
 - `root?: boolean` - if you specify `root: true` without using `target`, events will be connected to the root document element. If the `target` is a `string` and the `root` equals `true`, then elements will be searched relatively to the whole document. In other cases, `querySelector` will be run relatively to the components element.
 - `multiple?: boolean` - when set to true and the `target` is a string, it will connect the listener to all elements matching the selector. Otherwise, it will match to the first one found
 - `optional?: boolean` - if set to true, no error is logged, when matching element isn't found

So to add a `click` handler to all nested buttons you should write:

```ts
export const MyComponent = defineComponent((element, { on }) => {
    on('click', () => { // [!code focus]
        // handle click! // [!code focus]
    }, { target: 'button', multiple: true }) // [!code focus]
})
```

Or if you want to find all inputs on the page and listen to the `change`

```ts
export const MyComponent = defineComponent((element, { on }) => {
    on('change', () => { // [!code focus]
        // handle click! // [!code focus]
    }, { target: 'input', multiple: true, root: true }) // [!code focus]
})
```

And you can just grab an element and pass it, works too!

```ts
export const MyComponent = defineComponent((element, { on }) => {
    const child = useElementRef('child') // [!code focus]

    on('custom-event', () => { // [!code focus]
        // handle click! // [!code focus]
    }, { target: child.value, multiple: true, root: true }) // [!code focus]
})
```

## Removing listeners with `off`

To remove an event with `off`, you just pass an event name and a function you used, but it needs to be the same function, so it looks like this:

```ts
export const MyComponent = defineComponent((element, { on, off }) => {
    function onClick() {
        // ...
    }

    on('click', onClick)

    // later on ...
    off('click', onClick)
})
```

You don't need to pass `ListenerOptions`, just an event name and the function you used

## Removing listeners with returned callback

But there is also a more convenient way in some cases. When adding an event, `on` returns a callback to remove this specific listener, which means that you don't need to store your callback for a later removal.

```ts
export const MyComponent = defineComponent((element, { on, off }) => {
    const removeOnClick = on('click', () => {
        // ...
    })

    // later on ...
    removeOnClick()
})
```

## Using `on` in composables

When writing a composable, you only need to get component context using `useComponentContext` like this:

```ts
export function useMyThing() {
    const { on } = useComponentContext()

    on('click', () => /* ... */)
}
```

## Using `on` in modules

In modules, you can access `on` via the app instance, as it contains both of those methods as well. So if we would like to watch the window resize, we could do something like this:

```ts
export const ResizeModule = defineModule(({ app }) => {
    app.$on('resize', () => {
        // update on resize
    })
})
```

::: warning
Be careful with `app.$on` in your components. You can still use it there, but the listener won't be removed after the component is destroyed
:::
