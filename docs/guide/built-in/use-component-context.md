# Use Component Context

A helper composable to get current components context. It's not fully typed, as it's cannot always assume a context it's used in.

```ts
import { useComponentContext } from 'ovee.js'

export function useChange() {
    const { on, off, app, element } = useComponentContext()

    on('click', /* ... */)
}
```
