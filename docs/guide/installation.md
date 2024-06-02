# Installation

To add Ovee to a project, all you only need to do is add it as a dependency and set up the App.

::: code-group
```sh [pnpm]
pnpm add ovee.js
```

```sh [yarn]
yarn add ovee.js
```

```sh [npm]
npm install ovee.js
```

```sh [bun]
bun add ovee.js
```
:::

::: code-group
```js [main.js]
import { createApp } from 'ovee.js'
// get root element
const root = document.getElementById('app');
// run application
createApp().run(root)
```
:::

If you're not using [JSX](https://react.dev/learn/writing-markup-with-jsx) templates, then that's it! No other configuration is necessary.

## Scaffolding project

You can quickly create a ready-to-go project by running:

```sh
npx degit owlsdepartment/ovee-starter my-project
```

## Enable JSX templating

Ovee.js can optionally have [JSX](https://react.dev/learn/writing-markup-with-jsx) component templates, but using it requires a compiler with a little setup.

### TypeScript

[TypeScript](https://www.typescriptlang.org/) compiler can do this out of the box. All you need to do is update the [tsconfig.json](https://www.typescriptlang.org/tsconfig) file with these lines:

::: code-group
```json{4-5} [tsconfig.json]
{
    "compilerOptions": {
        // ...
        "jsx": "react-jsx",
        "jsxImportSource": "ovee.js",
        // ...
    }
}
```
:::

### Babel

With [Babel](https://babeljs.io/), you need to add the JSX plugin [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/babel-plugin-transform-react-jsx) and adjust the configuration:

::: code-group
```json{4-7} [babel.config.json]
{
    "plugins": [
        // ...
        ["@babel/plugin-transform-react-jsx", {
            "runtime": "automatic",
            "importSource": "ovee.js" }
        ]
        // ...
    ]
}
```
:::

