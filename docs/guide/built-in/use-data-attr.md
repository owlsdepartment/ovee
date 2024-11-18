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

## Multiple data attributes with a single composable

`useDataAttr` accepts as a first argument an array of strings or an object, where values are potential mapping functions, either built-ins or customs.

An example above can also be written like this:

```ts
import { useAttribute } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const { src, width, autoplay, my-attr: myAttr } = useDataAttr({ // [!code focus]
        src: '', /* no mapping active. You could also pass null or undefined */ // [!code focus]
        width: 'number', // [!code focus]
        autoplay: 'boolean', // [!code focus]
        'my-attr': { // [!code focus]
            get: v => v, // [!code focus]
            set: v => v.upperFirst() // [!code focus]
        } // [!code focus]
    }) // [!code focus]

    console.log(src.value)
    src.value = '...'
    width.value = 200
    autoplay = true
})
```

If we had a case, where we don't want to use mapping at all, we can pass an array:

```ts
import { useAttribute } from 'ovee.js'

export const MyComponent = defineComponent(() => {
    const [src, state, data] = useDataAttr(['src', 'state', 'data']) // [!code focus]
})
```
