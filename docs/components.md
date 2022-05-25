# Components

[[toc]]

## What is a Component
Component is a building block of your website or an application. In Ovee.js, it is represented by a class and corresponding markup. The framework detects html tag matching the component by either tag name, or a data parameter. Each instance of matched tag gets its own instance of component class.

Let's take a look at an example:

```html
<counter class="counter">
    <p class="counter__value"></p>
    <button class="counter__button">increment!</button>
</counter>
```

```js
import {
    Component,
    bind,
    el,
    reactive,
    register,
    watch
} from 'ovee.js';

@register('counter')
export default class extends Component {
    @reactive()
    counter = 0;

    @el('.counter__value')
    valueElement;

    @bind('click', { target: '.counter__button' })
    increment() {
        this.counter++;
    }

    @watch('counter', { immediate: true })
    update() {
        if (this.valueElement) {
            this.valueElement.innerHTML = `Current value: ${this.counter}`;
        }
    }
}
```

As we can see, within component class we can reference children elements that are contained within its corresponding DOM node. The framework gives us convinient mechanisms to bind events, DOM elements and react to data changes.

## Declaring and Registering Components
A component has to extend base `Component` class. For convenience, we provide `@register()` decorator, which defines the name that will be used to corelate it with a matching DOM element. Underneath, we define a custom element. Alternatively, you may define a `static getName()` method that would return a name.

In normal circumstances, you would not instantiate a `Component` manually. Instead, you should use `registerComponent()` method of `App` or pass it as an `App` argument. The `App` instance is responsible of handling, instantiating, and destroying components. More info about registering components within the `App` [here](/guide#initialization).

## Component options

You can register component with default global options. Every new instance of that component will get these options as a default ones.

```js
// passing options via App constructor
const app = new App({
    components: [
        [MyComponent, { option1: 'a', option2: true }]
    ]
})

// or via dynamic registration 
app.registerComponent(MyComponent, { option1: 'a', option2: true })
```

## Component Lifecycle
A component's lifecycle is prerty straightforward. In most cases, you shuld not override its constructor. Instead, use lifecycle hooks.
<mermaid>
graph TD
    A["new Component"] -- "binding refs, events, evaluating decorators" --> B["init()"];
    B --> C["component is up and running"];
    C -. "events and watchers loop" .-> C
    C -- "unbinding refs and events" --> Z["destroy()"];
    class A,B,C,Z className;
    classDef className fill:#fafafe,stroke:#323edd,color:#323edd,stroke-width:2px;
</mermaid>

All the initialization should be done within `init()` hook. Please mind, that it might be called in asynchronous manner in relation to constructor.

Bindings that were done using `$on()` method or `@bind()` decorator are automatically unbound during teardown. But in cases when you are using some external libraries or do manual event listener bindings, you should unbind and destroy them within `destroy()` hook.

## Linking to DOM
Ovee.js is using `MutationObserver` to handle changes in DOM and automatically initialize and teardown component instances. Within a `Component` instance, you always have access to its DOM node counterpart using `this.$element` property.

In many cases, you'll need to access component's child elements. While you can simply access them using DOM selectors, e.g. `this.$element.querySelector('.button')`, the framework provies you with a convenient way to link them dynamically to component properties. To acheive that, you can use `@el` directive.

```js
@el('.button--next')
buttonNextElement;
```

By default, the directive will use `querySelector()` to match a single [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/element). There are also cases, when you instead need to access a list of elements, for example to access all slides within a slider.

```js
@el('.slide', { list: true })
slideElementList;
```

In such case, you can pass `list: true` option to `@el` directive. Underneath, `querySelectorAll()` will be called, so you'll get static [`NodeList`](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) instance hooked into the property.

Additional profit of using this method is that the framework will update the property automatically when the DOM structure changes. Please mind, that in case of using `list: true` parameter, the whole `NodeList` will be updated each time a matching change in component's DOM occurs.

## DOM References
Using `@el()` directive is a very convenient way to hook child elements into component properties. Although, in some cases like creating generic, reusable components, you might want to avoid using CSS selectors. Instead, you can use references mechanism. To acheive this, you mark a reference in your markup using `ref` property. For example:

```html
<button type="button" class="button button--next" ref="buttonNext">Next</button>
```

Now in the component, you can access all refered buttons:
```
this.$refs.buttonNext
```

For each `$refs` key, you'll get an array of matching nodes. Refs are automatically updated, when DOM changes. If you ever used Vue, you might be familiar with this mechanism. However, please mind that while in Vue component's markup template is always known, in Ovee.js the same JS component class may be used with different markup structures. Therefore, you should always write your code to check, if the reference is even there. The most convenient way is to use [optional chanining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining).

```
this.$refs?.searchInput?.focus?.();
```

## Event Handling
There are two ways to listen events on a component, using:
 - decorator `@bind()`
 - `this.$on()` and `this.$off()`

In previous example, we enabled listening of a `click` event on a button using decorator `@bind`. It expects 2 arguments: first is an event or list of space seperated events to listen and second is options object. If `target` isn't passed to option, we will listen on root `this.$element`. `target` can be a precise element or a query string, that searches for target relatively to `this.$element`. This behaviour can be changed, by adding `root: true`. Than we search for target relatively to current document.

This example shows us, how to listen on `focus` and `blur` on a parent and `click` on inner button:

```js
@register('base-example')
export default class extends Component {
    // some code

    @bind('click', { target: '.counter__button' })
    onButtonClick() {
        // handle click
    }

    @bind('focus blur')
    onFocusChange() {
        // handle focus
    }

    @bind('scroll', { target: window })
    onScroll() {
        // handle scroll
    }
}
```

We can do the same using `this.$on`, that we gain by extending `Component` class.

```js
@register('base-example')
export default class extends Component {
    // some code
    init() {
        this.$on('click', this.onButtonClick, { target: '.counter__button' });
        this.$on('focus blur', this.onFocusChange);
        this.$on('scroll', this.onScroll, { target: window })
    }

    onButtonClick() {
        // handle click
    }

    onFocusChange() {
        // handle focus
    }

    onScroll() {
        // handle scroll
    }
}
```

Notice, that we don't have to remove those listeners. When component is being destroyed, they are automatically removed. If you would like to remove listener earlier, for any reason, you can do it manually by using `$off` and passing the same arguments, that `$on` received. It is possible, because decorator `@bind` uses `$on` internally.

Method `$on` returns also a callback, that removes event listener. It can be called later at any point and it works for multiple events.

```ts
@register('base-example')
export default class extends Component {
    // some code
    init() {
        const removeScroll = this.$on('scroll', this.onScroll, { target: window });

        this.$on('click', () => {
            removeScroll();
        }, { target: '.stop-scroll', root: true });
    }
}
```

In this example, we listen passively to scroll, until button with class `.stop-scroll` is clicked.

Method `$on`, as well as `@bind`, accepts all `addEventListener` options as it's third argument, so we can explicitly use `passive: true` or `capture: false` modifiers. All `addEventListener` options can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters). `$off` method needs 


Full signature for methods `$on` and `$off`:

```typescript
function $on(events: string, callback: Callback<this>, options?: ListenerOptions): () => void;

function $on(events: string, callback: Callback<this>, options?: TargetOptions): void;

interface ListenerOptions {
    target?: EventTarget | string;
	root?: true;

    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}

interface TargetOptions {
    target?: EventTarget | string;
	root?: true;
}
```

## Reactivity and Watching Properties
`Ovee.js` allows you to make some class property reactive, that is when it gets changed, all other reactive elements and watchers, that depend on this property, are notified about that. Reactivity is really useful in `TemplateComponent` that we cover in a next section.

To make property reactive, we use decorator `@reactive`:

```js
export default class extends Component {
    @reactive()
    counter = 0;
}
```

It's not doing much by itself, but what if we want to do something, when it is changed? We would then use decorator `@watch`.

```js
export default class extends Component {
    @reactive()
    counter = 0;

    @watch('counter')
    onCounterChange() {
        console.log(`Counter was changed to: ${this.counter}`)
    }
}
```

Now we will be notified when `counter` is changed.

Decorator `@watch` accepts two arguments:
 - `watchSource` - string path to component reactive property (could be something like `obj.a`), `ref` instance, or method that returns value from reactive object (more details in [@watch](/component-decorators.md#watch) section)
 - optional object with field `immediate` that accepts `boolean`. If `immediate` is `true`, watching method will be called immediatly after component initialization with current value. In other case, it will be called only when something changes.

Method, that we decorate, will receive 2 arguments:
 - current value
 - previous value

__Important!__ `@watch` can only watch properties marked as `@reactive` as in `Ovee.js` nothing is reactive by default in opposite to frameworks like `Vue`, `React` or `Angular`.

__Deprecation Note:__ In `Ovee,js` versions below `2.1`, watch callback received 3rd argument, watch path, which was removed as of `2.1`.

Since `v2.1`, we can also use another decorator `@watchEffect`, which doesn't require specific watch source. It automatically catches all reactive references.

Example:
```js
export default class extends Component {
    @reactive()
    counter = 0;

    @watchEffect()
    onCounterChange() {
        console.log(`Counter was changed to: ${this.counter}`)
    }
}
```

`@watchEffect` runs immediately and on a first run does magic with gathering necessary references. More on that: [@watchEffect](/component-decorators.md#watcheffect)

You can read more about `reactivity` in [Reactivity overview](/reactivity/overview).

## Template Components
In earlier example, with `counter` component, we had to update DOM manually when `this.counter` value was changed. But we can do it easier, by using `TemplateComponent` and implementing it's method `template`. Example:

```js
import {
    TemplateComponent,
    bind,
    reactive,
    register
} from 'ovee.js';

@register('counter')
export default class extends TemplateComponent {
    @reactive()
    counter = 0;

    @bind('click', '.counter__button')
    increment() {
        this.counter++;
    }

    template() {
        return this.html`
            <p class="counter__value">Current value: ${this.counter}</p>
            <button class="counter__button">increment!</button>
        `
    }
}
```

We do not need `valueElement` property and `update` method. If property used in `template` method is reactive, DOM will be updated automatically.

Sometimes, you would like to force template to rerender, because of some non-reactive change or you would like to wait for current pending updates.
Then you can use `this.$requestUpdate()` method that returns `Promise` that will resolve after rerender.

If you want to run init code after the template is first time rendered into DOM, then you can `await this.$requestUpdate()` in `init` function.

```js
import { TemplateComponent, register } from 'ovee.js';

@register('counter')
export default class extends TemplateComponent {
    async init() {
        console.log(this.$element.querySelector('.some-wrapper')) // will print `null`, as template wasn't rendered yet

        await this.$requestUpdate();

        console.log(this.$element.querySelector('.some-wrapper')) // will print element instance
    }

    template() {
        return this.html`
            <div class="some-wrapper"></div>
        `
    }
}
```

To render template, template components uses [`lit-html`](https://github.com/polymer/lit-html). Guide: <https://lit-html.polymer-project.org/guide>.

We are also recomending some tools and helpers for `lit-html` to use with your IDE: <https://lit-html.polymer-project.org/guide/tools#ide-plugins> or for `VS Code`: <https://marketplace.visualstudio.com/items?itemName=bierner.lit-html>.
