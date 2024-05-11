# Use Query Selector

Returns an Ovee Ref, which reactively tracks an element, that matches the used selector. If an element is modified, those changes will be reflected.

```ts
import { useQuerySelector } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const submitButton = useQuerySelector('.my-component__submit')
    const audio = useQuerySelector<HTMLAudioElement>('audio')

    onMounted(() => {
        audio.value?.play()
    })
})
```

## Multiple Elements

If you want to match the selector against multiple components.

```ts
import { useQuerySelectorAll } from 'ovee.js'

export const MyComponent = defineComponent((_, { on }) => {
    const inputs = useQuerySelectorAll('input')
    const headings = useQuerySelectorAll('h2')

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
