# Use Element Ref

Returns `OveeRef` with elements instance, matching `ref="..."` value. It only will search for refs inside a component.

::: code-group
```ts [MyComponent.ts]
import { useElementRef } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const button = useElementRef<HTMLButtonElement>('toggle')

    onMounted(() => {
        button.value // buttons instance
    })
})
```

```html [index.html]
<div data-my-component>
    <button ref="toggle" type="button">
        Toggling
    </button>
</div>
```
:::

## Multiple elements

If you want to return multiple elements with the same ref value:

::: code-group
```ts [MyComponent.ts]
import { useElementRefs } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const items = useElementRefs('item')

    onMounted(() => {
        items.value.forEach(item => {
            console.log(item)
        })
    })
})
```

```html [index.html]
<ul data-my-component>
    <li name="item">Item 1</li>
    <li name="item">Item 2</li>
    <li name="item">Item 3</li>
</ul>
```
:::
