# JSX and Writing Component Templates

When using Ovee, you write an HTML and add an Ovee component. That's the way, we did it all until now. But Ovee components can also declare their templates upfront. You can do it, by leveraging JSX and `useTemplate` helper. Before diving deeper into Ovee-specific implementation, you may want to look up how JSX language works. We recommend some chapters from React's documentation: [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces), and [Responding to Events](https://react.dev/learn/responding-to-events).

::: warning Some differences compared to React's JSX
In Ovee, you should use `class` instead of `className`, just like in normal HTML.
:::

Now, let's see how to utilize it in your components.

## Declaring a template

With `useTemplate` helper, you can declare JSX templates, that your component will render.

```tsx
export const MyComponent = defineComponent(() => {
    useTemplate(() => <div>Hi from component!</div>)
})
```

It accepts a single function, that returns a propers, JSX template. This one would just render a `div` with simple text. It's not very impressive, but it's a start. But what about a more complex example, like a counter component, which can display the current counter value with a button, that adds +1 to our value?

```tsx
export const SimpleCounter = defineComponent(() => {
    const count = ref(0)

    function onClick() {
        count.value += 1
    }

    useTemplate(() => (
        <div>
            <p>Counter value: {count.value}</p>

            <button type="button" onClick="{onClick}">Add +1</button>
        </div>
    ))
})
```

This simple example is all we need. By leveraging reactivity, we can use ref to store counter value. Then, whenever the counter value changes, our template rerenders, updating its output properly. It's possible because `useTemplate` detects all reactive references that were used when rendering a template. `Reactive` objects and `computeds` are no exception.

## Manually requesting template's update

There are rare cases when we want to force template updates, because of some non-reactive changes. Our tool can return a function for that. It's called: `requestUpdate` and you can use it like that:

```tsx
export const SimpleCounter = defineComponent(() => {
    const { requestUpdate } = useTemplate(() => (
        <div>{new Date()}</div>
    ))

    setTimeout(() => {
        requestUpdate()
    }, 1000)
})
```

This example updates a component every second, rendering proper date and time. You can `await requestUpdate` to wait for changes to apply.

## Using Ovee components in the JSX template

When writing JSX templates, there could be a place, where you need a component with a JSX template, inside another components template. To achieve that, components expose a field `.jsx` that returns proper JSX component.

```jsx
import { OtherComponent } from '@/components'

export const MyComponent = defineComponent(() => {
    useTmeplate(() => (
        <div>
            Content

            <OtherComponent.jsx />
        </div>
    ))
})
```

## Slots

Let's imagine a situation where we have a button component. Through attributes, we can pass the button's inner text. That's cool. But what when we want to pass some more specific HTML? Maybe a bold or italic in certain parts of the text? Maybe something like an icon? Then we have a problem. We could make multiple components, that reuse this one, but it's not really efficient and heavily violates the DRY rule.

Luckily, that problem has already been solved in multiple other frameworks via slots and Ovee also adopts this solution. It's especially well-known in the Vue ecosystem.

Slots let you pass some markup to your component via a slot and the component renders it in a place it needs. Slots are accepted both from HTML markup, as well as from JSX. But let's start with a component that accepts a slot, like our button example, that we discussed earlier.

```tsx{2,6}
export const TheButton = defineComponent(() => {
    const slot = useSlots()

    useTemplate(() => (
        <button type="button">
            {slot()}
        </button>
    ))
})
```

To enable slots, we need `useSlots` composable, which returns a function, that you can call in a JSX template. And that's it! Now let's focus on passing your slots from the HTML

```html
<the-button>
    <span class="icon icon-cog" />

    User settings
</the-button>
```

Or from JSX

```tsx
import { TheButton } from '@/components'

export const TheNav = defineComponent(() => {
    useTemplate(() => (
        <TheButton.jsx>
            {() => <>
                <span class="icon icon-cog" />
    
                User settings
            </>}
        </TheButton.jsx>
    ))
})
```

With JSX you need to pass a function that returns a JSX template.

And that's it... but wait. What if we want more slots for specific places in our markup?

### Named slots

Our slot function accepts an optional argument: a string with the slot's name. So let's make our button a little bit more complex!

::: info Default slot
When a slot without name is used, its name is assumed to be `default`, so a function call `slot()` and `slot('default')` result in the same output
:::

```tsx{2,6}
export const TheButton = defineComponent(() => {
    const slot = useSlots()

    useTemplate(() => (
        <button class="the-button" type="button">
            <span class="the-button__icon">
                {slot('icon')}
            </span>

            <p class="the-button__content">
                {slot()}
            </p>
        </button>
    ))
})
```

Now our component accepts 2 slots: `default` and `icon`. Now to pass them some data via HTML:

```html
<the-button>
    <template slot="icon">
        <span class="icon icon-cog" />
    </template>

    User settings
</the-button>
```

Or with JSX

```tsx
import { TheButton } from '@/components'

export const TheNav = defineComponent(() => {
    useTemplate(() => (
        <TheButton.jsx>
            {{
                icon: () => <span class="icon icon-cog" />,
                default: () => 'User settings'
            }}
        </TheButton.jsx>
    ))
})
```

With multiple components, a single function turns into an object, where the keys are the slot names.
