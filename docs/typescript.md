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
