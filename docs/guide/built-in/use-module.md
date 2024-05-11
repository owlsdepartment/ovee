# Use Module

Returns module instance registered in the App. Accepts module's name or its declaration. If the second argument is `true`, then an error is not thrown, when a module is missing.

When module declaration is passed, type is interfered and instance type is known. It's a preferred way.

```ts
import { useModule } from 'ovee.js'

import { ModuleA } from '@/modules'

export const MyComponent = defineComponent(() => {
    const moduleA = useModule(ModuleA) // throws an error, if module is missing
    const moduleb = useModule('ModuleB', true) // allow missing module
})
```
