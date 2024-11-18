# Use Component

Helper composable for using components as composables inside other components or composables

```ts
import { useComponent } from 'ovee.js'
import { SomeComponent } from '@/components'

export function useChange() {
    const someComponent = useComponent(SomeComponent) // retuns component instance

    someComponent.cool()
}
```

If component accepts options, you can pass them in the composable.

```ts
import { useComponent } from 'ovee.js'
import { SomeComponent } from '@/components'

export function useChange() {
    const someComponent = useComponent(SomeComponent, {
        namespace: 'change'
    })
}
```
