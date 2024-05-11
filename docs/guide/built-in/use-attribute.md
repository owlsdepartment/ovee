# Use Attribute

Returns `OveeRef` to get/set specific elements HTML attribute. With no argument, it returns a string value, but you can use predefined maps, to read its value as a number or a boolean.

```ts
import { useAttribute } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const src = useAttribute('src')
    const width = useAttribute('width', 'number') // width.value returns numeric value
    const autoplay = useAttribute('autoplay', 'boolean')
    const myAttr = useAttribute<string>('my-attr', {
        get: v => v,
        set: v => v.upperFirst() // will always set attribute with first letter in upperCase
    })

    console.log(src.value) // read src value
    src.value = '...' // change src attribute
    width.value = 200
    autoplay = true
})
```

::: note
Returned ref is fully reactive and will work with other reactive tools
:::
