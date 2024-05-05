# Use Component Context

A helper composable to get current components context.

```ts
import { useComponentContext } from 'ovee.js'

export function useChange() {
    const { on, off, app, element } = useComponentContext()

    on('click', /* ... */)
}
```
