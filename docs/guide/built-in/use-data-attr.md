# Use Data Attr

Return an `OveeRef` to get or set a dataset field and `data-*` attribute. With no argument, it returns a string value, but you can use predefined maps, to read its value as a number or a boolean.

```ts
import { useDataAttr } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const src = useDataAttr('src') // access data-src
    const width = useDataAttr('width', 'number') // access data-width, width.value returns numeric value
    const autoplay = useDataAttr('autoplay', 'boolean') // access data-autoplay, autoplay.value returns boolean value
    const myAttr = useDataAttr<string>('my-attr', {
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
