# TypeScript
Because we believe, that type safety is a way of making your code more secure and reliable, `Ovee.js` is fully written in TypeScript, so don't worry. You can totally use it in your TS projects!

[[toc]]

## Overriding App class
When creating a module, you may end up extending `$app` with your custom properties and methods. To allow this in your whole app, extending `class App` is a good idea and you can do it like this:

```typescript
declare module 'ovee.js' {
    class App {
        myCustomProp: string;

        myCustomAppMethod(name: string): void;

        // ...
    }
}
```

By doing this, your properties and methods that were added to `$app` will be visible in components.

## Declaring Component options and element (since v2.1.10)

Components accept two genericc, since v2.2.0: for `$element` and `$options`. This way you can customize on which `Element` type your component should be used and what configurable options should receive.

```ts
// NOTE: only fields not supplied with default value should be marked as optional with `?`
interface AppSliderOptions {
    slidesPerView: number;
    slideDelay: number;
}

@register('app-slider')
class AppSlider extends Component<HTMLDivElement, AppSliderOptions> {
    init() {
        // we can use `slideDelay`
        const delay = this.$options.slideDelay
        // typed as `HTMLDivElement`
        const el = this.$element
    }
}
```

Defining these generics is optional and can be ommited, if you're satisfied with default values.

## Declaring Module options

Modules accept one generic, and that is it's options. It works the same way like components options

```ts
interface AppModuleOptions {
    delay: number;
}

class AppModule extends Module<AppModuleOptions> {
    init() {
        // fully typed as number
        const { delay } = this.$options;
    }

    static getName() {
        return 'AppModule'
    }
}
```

# Using Component class type or Module class type (since v2.1.10)

If you want to assign class or module to a variable (f.ex.: components array), you should use built in classes

```ts
import { ComponentClass } from 'ovee'

const components: ComponentClass[] = [
    MyComponent,
    OtherComponent
]
```

for modules

```ts
import { ModuleClass } from 'ovee'

const components: ModuleClass[] = [
    MyModule,
    OtherModule
]
```

> *Why not just use `Component` or `Module` type?*

Because these are instance types. If you want to move around class constructor, you need to get it's type, which is even harder with generics, so we exposed these types, that are also internally used by `ovee.js`.
