# Introduction

[[toc]]

## What is Ovee.js
Ovee.js is a lightweight, component-based JavaScript framework built to work with server-side rendered markup. It's meant to bring the modern toolset to the traditional workflow.

## Installation

```shell
yarn add ovee.js

# or

npm install --save ovee.js
```

Additionally, `lit-html` is a required peer dependency, that needs to be installed as well, so if you don't have it in your project yet, install it, using:

```shell
yarn add lit-html

# or

npm install --save lit-html
```

## Browser Support
Ovee.js used with babel supports all modern browsers. Currently it's meant to be used with a bundler to provide support for novel features like MutationObserver and decorators.

## Quick Start
We made a quick start setup that can help you go up and running with a few commands. It uses [Vite](https://vitejs.dev/), and excluding one simple example, is quite plain, so feel free to test Ovee there or even use it as a base for your future project!

To install it:

```shell
npx degit owlsdepartment/ovee-starter my-project

cd my-project
# install dependencies
yarn
# and run it!
yarn dev # or serve
```

## Getting Started
Ovee.js app lives around a root element. It acts as a container for all its components and modules. Let's take a look at some code.

```html
<div id="app"></div>
```

```js
import { App } from 'ovee.js';

const root = document.getElementById('app');
const app = new App();

app.run(root);
```

This way we get a working application. It doesn't do much so far, but is ready to work. It will be our starting point to do some more interesting stuff.

## Lifecycle
The app starts its lifespan as soon, as you call `app.run(root)` method. You should register all components and modules before that point. As soon as you call `app.run(root)`, the app object starts to observe all DOM changes within the root container (using [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)).

### Components
Component objects are being automaticaly initialized as soon as matching selector appears in DOM and destroyed when such node is removed. Component API exposes lifecycle hooks.

You can find more info in [Component Lifecycle](/components/#component-lifecycle) section of Component documentation.

### Modules
Modules are initialized at `app.run(root)`. For each module, always only a single instance is initialized, and it lives until the app gets destroyed. Module API exposes lifecycle hooks.

You can find more info in [Module Lifecycle](/modules/#module-lifecycle) section of Module documentation.

### Destroying the app object
In typical use case, the app lives until the user closes the browser tab. In such case, there's no need to destroy it. In more complex cases, like multi-root apps, you may need to clean up the app object. In such case, you should call `app.destroy()`. It will dispose all components and modules automaticaly.

## Decorators
Ovee.js uses ECMAScript decorators quite heavily. Despite this JS feature it's still in a proposal state, we've decided to utilize it as it brings amazing clarity to component code. You can find out more about ES decorators notation [here](https://github.com/tc39/proposal-decorators).

## Initialization
As mentioned in [Getting Started](#getting-started) section, `App` object acts as a spine of the application. It provides two ways of registering components and modules. You can do it either using options objects passed into constructor:

```js
import { App } from 'ovee';

import OveeBarba from '@ovee.js/barba';

import TodoList from './components/TodoList';
import TodoListItem from './components/TodoListItem';

const app = new App({
    components: [
        TodoList,
        TodoListItem
    ],
    modules: [
        OveeBarba
    ]
});
```

Alternative notation is to use `registerComponent()` for single component or `registerComponents()` for multiple components and `use()` for modules. Example:

```js
import { App } from 'ovee.js';

import OveeBarba from '@ovee.js/barba';

import TodoList from './components/TodoList';
import TodoListItem from './components/TodoListItem';

const app = new App();

app.registerComponent(TodoList);
app.registerComponent(TodoListItem);
// OR
app.registerComponents([
    TodoList,
    TodoListItem
]);

app.use(OveeBarba);
```

### Passing options into components
You can pass options object while registering a component. This object will be available in all component instances. Let's show this once again as an example, as it says more than a thousand words:

```js
const app = new App({
    components: [
        ContactForm,
        [Slider, {
            loop: true,
            speed: 500
        }]
    ]
});

app.registerComponent(NavToggle, {
    toggleClassName: 'menu__is-visible'
});
```

### Passing options into modules
Similarly to components, you can pass options object while registering a module. This object will be available in a module instance.

```js
const app = new App({
    modules: [
        [OveeBarba, {
            transitions: [
                defaultTransition
            ]
        }]
    ]
});

app.registerComponent(DetectBrowsers, {
    addClassesToHtml: true
});
```

## Configuration
You can configure the `App` object a little bit. In most cases you won't need to change these options, but it's worth to tell you that you can. You can pass `config` object into constructor options, or use `setConfig(config)` method. Configuration is being merged with the defaults, so you don't need to pass all the options if you only want to change one.

```js
const app = new App({
    options: {
        namespace: 'ymce',
        productionTip: false
    }
});
```

### Available configuration options

| Option | Default Value | Description |
|:------ |:------------- |:----------- |
| `namespace` | `'ovee'` | during its lifecycle, the framework uses namespacing prefixes e.g. for css classes it adds, and events it triggers and listens to. |
| `productionTip` | `process.env.NODE_ENV !== 'production'` | displays a tip on console if the app is not built for production to remind you, that development build is not optimized. |
| `global` | `window` | global object, in browser it should be set to window |
| `document` | `document` | document object, leave it as is unless you really know what you're doing |

### Retreiving configuration
You can access the current `App` configuration using `getConfig()` method. Please mind, that it returns a copy of the configuration, so changing anything in this object won't mutate the current configuration.