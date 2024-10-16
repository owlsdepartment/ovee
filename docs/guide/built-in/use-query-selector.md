# Use Query Selector

# Single Element

Returns an Ovee Ref, which reactively tracks an element, that matches the used selector. If an element is modified, those changes will be reflected. It optionally accepts a dynamic root, against which the query will be run. Root can be a plain value, a getter function or a computed.

```ts
import { useQuerySelector } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const header = document.querySelector('header')
    const submitButton = useQuerySelector('.my-component__submit')
    const audio = useQuerySelector<HTMLAudioElement>('audio')
    const burger = useQuerySelector('.heading__burger', header)

    onMounted(() => {
        audio.value?.play()
    })
})
```

## Multiple Elements

If you want to match the selector against multiple elements. It also accepts optional a dynamic root.

```ts
import { useQuerySelectorAll } from 'ovee.js'

export const MyComponent = defineComponent((_, { on }) => {
    const header = () => document.querySelector('header')
    const inputs = useQuerySelectorAll('input')
    const headings = useQuerySelectorAll('h2')
    const links = useQuerySelectorAll('.header__link', header)

    watchEffect(() => {
        console.log(`headings amount: ${headings.value.length}`)
    })

    onMounted(() => {
        on('change', () => {
            // react on inputs change
        }, { target: inputs.value })
    })
})
```
