# Declaration Part

TemplateComponent:
 - inserts HTML on mount

## Idea 1

```tsx
export const MyComponent = defineComponent(() => {
    useTemplate(() => (
        <p>Some text</p>
    ))

    return {
        // context...
    }
})
```

Edge case:
 - multiple templates: should we even allow it? They can append one after another and mark they're root
 - what if there is already an HTML code inside. Built-in integration with slots and saved to `default` slot
 - what about components inside, that are already initialized. `destroy` and recreate? try to salvage them into a new tree? HTML duplication?

# Anonymous Components Inside Template

If the component is not registered, we need to create anonymous element that would store component's instance itself.

Special reserved name: `ovee-anonymous` or `ovee-template` (smth like that) for components like that

```tsx
import SomeComponent from './SomeComponent'

const OtherOne = () => (
    <SomeComponent />
)
```

```html
<!-- maybe with 'for="some-component"' attribute -->
<ovee-anonymous>
    <!-- template rendered in here -->
</ovee-anonymous>
```

# TODO
 - how to pass 'slots' to anonymous HTML compoennts? I guess slot system smhw or rather to function argument's itself
 - situation, when in JSX we have nested components inside templates (`beforeMount` should resolve this problem)
