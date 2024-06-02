# Use Prop

Returns `OveeRef` to get/set elements instance property.

```ts
import { useProp } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const width = useProp('clientWidth') // it's readonly
    const autoplay = useProp('autoplay')

    console.log(width.value) // read widths current value
    autoplay = false
})
```

::: warning
Returned ref is NOT reactive as it reads elements instance values directly
:::
