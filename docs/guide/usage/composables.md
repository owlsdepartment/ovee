# Composables

When writing front-end code, one of the most useful and powerful concepts is composition. It lets you take a piece of code from one place and reuse it anywhere else multiple times. It's mostly unaware of the place where it's used and makes a very loose dependence on its parent.

With that in mind, Ovee.js is fully designed around that idea. In Object Oriented Programming you can find some design patterns that implement that idea, like decorators or mixins. In Ovee.js, with a more functional approach, you have `composables`. Simple functions that are called in a specific context, in that case, the component's setup function. They can be parameterized using function parameters and they can return data to the parent, as they are but humble functions, doing their work.

::: tip
Ovee.js composable is the same concept with similar implementation as [Vue composables](https://vuejs.org/guide/reusability/composables.html) or [React hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#custom-hooks-sharing-logic-between-components)
:::

## Example: Mouse tracking

We'll start with a simple example to warm up. Let's say, you want to track users' mouse position. In the Ovee component, it would look something like this:

```ts
export const MouseComponent = defineComponent((el, { on }) => {
    const state = reactive({
        x: 0,
        y: 0
    })

    onMounted(() => on('mousemove', event => {
        state.x = event.pageX
        state.y = event.pageY
    }))
})
```

With a few lines of code, we can now track the mouse position. Awesome!

::: tip
Note that we don't remove event listener with `off`. When the component is being destroyed, all `on` listeners are removed automatically.
:::

But now, if we want to do this in some other place, we need to copy this code again and again... but that's when our composable comes into play! Let's see its implementation, and then analyze it.

::: code-group
```ts [useMousePosition.ts]
export function useMousePosition() {
    const { on } = useComponentContext()
    const x = ref(0)
    const y = ref(0)

    onMounted(() => on('mousemove', event => {
        x.value = event.pageX
        y.value = event.pageY
    }))

    return {
        x,
        y
    }
}
```

```ts [MyComponent.ts]
export const MyComponent = defineComponent(() => {
    const { x, y } = useMousePosition()
})
```
:::

Most of the code stays the same. The first minor change is the usage of `ref` instead of `reactive`. That way you allow your function consumers, to use destructuring. It's a preferred behavior in most cases, but of course, it all comes down to how your composable will be used. You can go even further and wrap `ref` in `computed`, to make them read-only.

The second change is the use of `useComponentContext`. It returns the current component's context. This way you can access its `options`, `name`, `app`, `element`, and `on/off` methods, as you would in the component itself through 2nd argument.

And that's it! We just return data we want to, in this case, mouse x and y coordinates, and our composable is ready to go!

## Example: Detecting if a component is in the viewport

Let's try to write another composable. This one will check if our element is currently visible in a viewport. We will use [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) API and we will add a way to configure our composable. Let's start simple!

```ts
export function useInViewport() {
    const { element } = useComponentContext()
    const isVisible = ref(false)
    let observer

    onMounted(() => {
        observer = new IntersectionObserver(([entry]) => {
            if (!entry) return

            isVisible.value = entry.isIntersecting
        }, { threshold: 0.5 })
        observer.observe(element)
    })

    onUnmounted(() => {
        observer?.disconnect()
    })

    return isVisible // we return ref directly, so a user can easily change it's name on the outside
}
```

With `useComponentContext`, we get the root element. Then, when the component is being mounted, we create `IntersectionObserver` and start to observe our element. We also added an `onUnmounted` hook, to do a clean-up, when the component is removed, so we don't end up with polluted memory. Finally, we return reactive ref with the current visibility state.

## Components are composables

One of the greatest advantages of Ovee is that you can use multiple components on the same element. Apart from declaring them in the template, you can use them INSIDE the components setup itself, just like you would use a composable! There is a helper composable for that: `useComponent`.

```ts
export const MyComponent = defineComponent(() => {
    useComponent(OtherComponent)
})
```

And just like that, you have a component inside of a component! It also returns a components instance, so you can access it immediately.

```ts
export const MyComponent = defineComponent(() => {
    const otherInstance = useComponent(OtherComponent) // [!code focus]

    otherInstance.doSomething() // [!code focus]
})
```
