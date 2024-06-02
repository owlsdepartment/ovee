# Use Query Component

Returns an Ovee Ref, which reactively tracks a component instance, that matches the used selector via the component name or component declaration. If an element is modified, those changes will be reflected. Passing a component is a preferred way, as an instance type can be inferred by typescript.

It also accepts an optional second argument: `target`. If passed, a search will be performed relative to the passed element and will not 

```ts
import { useQueryComponent } from 'ovee.js'

import { AnimatedBackground } from '@/components'

export const MyComponent = defineComponent(() => {
    // no type hinting
    const heading = useQueryComponent('CustomHeading')
    // with type hinting
    const background = useQueryComponent(AnimatedBackground, document)

    onMounted(() => {
        heading.value?.animate()
        console.log(background.value?.isPlaying)
    })
})
```

## Multiple Components

If you want to match the selector against multiple components.

```ts
import { useQueryComponentAll } from 'ovee.js'

import { SingleDot } from '@/components'

export const MyComponent = defineComponent((_, { on }) => {
    const dots = useQueryComponentAll(SingleDot)

    on('resize', () => {
        dots.value.forEach(dot => {
            dot.update()
        })
    }, root: true)
})
```
