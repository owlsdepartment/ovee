# Component Decorators

Ovee.js uses ECMAScript decorators quite heavily. Despite this JS feature it's still in a proposal state, we've decided to utilize it as it brings amazing clarity to component code. You can find out more about ES decorators notation [here](https://github.com/tc39/proposal-decorators).

[[toc]]

## @register
Adds static method `getName()` that returns name of a component. This method is required for a component to be registered.

Parameters:
 - `name: string` - name of component. Must be a two word name, either in `PascalCase`, `camelCase` or `kebab-case`

Example:
```js
@register('baseComponent')
class extends Component {}
```

## @el
Binds element found in children of `this.$element` with `selector` passed to `querySelector` or `querySelectorAll`. If DOM structure in `this.$element` changes in any way, the reference is updated.

Parameters:
 - `selector: string` - selector passed further to `querySelector` or `querySelectorAll`
 - `options?: { list?: boolean }` - optional object with property `list`. If set to `true`, `querySelectorAll` will be used and [`NodeList`](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) would be returned.

Example:
```js
@register('baseComponent')
class extends Component {
    @el('.counter__button')
    button;

    @el('.slide', { list: true })
    slides;
}
```

## @bind
Bind method as a callback for specified event listeners. Automaticlly removes them on `destroy`.

Parameters:
 - `events: string` - string of space separated events to listen to.
 - `target?: string | Element` - optional selector or specific element for which child element bind listeners. If not specified, root element will be used.
 - `selector?: string` - optional selector. If target was specified, selector will be used relatively to passed target and listener will be bound to found element

Example:
```js
@register('baseComponent')
class extends Component {
    @bind('mousein mouseout')
    onMouseChange() {
        // ...
    }

    @bind('click', '.base__submit')
    onSubmit() {
        // ...
    }

    @bind('resize', window)
    onResize() {
        // ...
    }

    @bind('click', '.dialog--upper', '.close-button')
    onCloseDialog() {
        // ...
    }
}
```

## @reactive
Makes property reactive by using [`makeReactive`](/reactivity#makeReactive).

Example:
```js
@register('baseComponent')
class extends Component {
    @reactive()
    counter;
}
```

## @prop
Adds one way binding from root element (`this.$element`) property to class instance property. Any changes made to this elements property value, will change instance property, but not the other way around. That makes this property readonly.

Parameters:
 - `propName?: string` - optional name of element's property. If not specified, class instance property name is used.

Example:
```js
@register('baseComponent')
class extends Component {
    @prop()
    scrollHeight;

    @prop('className')
    class;

    init() {
        if (!this.class.includes('is-open')) {
            this.$element.classList.add('is-open')
        }
    }
}
```

## @dataParam
Just like `@prop`, adds one way binding, but on `data-...` properties of root element. Any changes made to this elements data value under specified key, will change instance property, but not the other way around. That makes this property readonly.

Parameters:
 - `propName?: string` - optional name of element's property. If not specified, class instance property name is used.

Example:
```js
@register('baseComponent')
class extends Component {
    @dataParam()
    initial; // will bind to data-initial

    @dataParam('loaded')
    isLoaded; // will bind to data-loaded
}
```

## @watch
Watch given path and call method that decorates, when value under given path change. Can only watch properties, that are marked as reactive. Uses [`doWatch`](/reactivity#doWatch) underneath.

Parameters:
 - `path: string | WatchSource | Array<WatchSource | object>` - source to watch. If source is path, than it's path to watch under `this`, f.ex.: `counter`, `obj.a`. Otherwise, it needs to be either: `ref` or `makeComputed` instance, `function` that returns reactive value like: `() => data.test`, or multisource as `array` of previous options. More on that in [`doWatch`](/reactivity#doWatch)
 - `options?: { immediate?: boolean }` - optional object with property `immediate`. When set to `true`, decorated method will be called immediatly after init. In other case, it will be called only after watched value changes.

Example:
```js
@register('baseComponent')
class extends Component {
    @reactive()
    counter = 0

    @reactive()
    data = { name: 'test name' }

    @watch('counter')
    onCounterChange(newVal, oldVal, path) {
        // do something on change
    }

    @watch('data.name', { immediate: true })
    onNameChange() {
        // do something on change
    }
}
```

## @watchEffect
Works almost the same way as `@watch`, but don't require from you to specify what sources to watch for.
If you reference reactive value inside, `@watchEffect` will catch it and remember, so it's actually much more pleasent to use than classic `@watch`.

Also, in opposite to `@watch`, `@watchEffect` will run almost immediately after declaration as it needs to catch initial reactive references. Uses [`doWatchEffect`](/reactivity#doWatchEffect) underneath.

Example:
```js
@register('baseComponent')
class extends Component {
    @reactive()
    counter = 0

    counterText = ''

    @watchEffect()
    updateCounterText() {
        this.counterText = `Current counter value: ${this.counter}`;
        this.$el.innerHTML = this.counterText;
    }

    init() {
        setInterval(() => {
            // this will make the counter update every 1s
            // and will cause our innerHTML to update as well
            this.counter += 1;
        }, 1000)
    }
}
```


## @computed
Creates a reactive function that is lazy and caches it's last result. It also works when reactive objects and reevaluates only if any reactive reference inside was changed.

It's the same concept and implementation as Vue's `computed`.

This decorator can only be used on a `get` accessor.

Example:
```js
import { ref } from 'ovee.js'

// we can use external reactive variable
const counter = ref(0)

@register('baseComponent')
class extends Component {
    multiplier = 2

    @computed()
    get multipliedCounter() {
        return counter.value * this.multiplier;
    }

    init() {
        // counter: 0, multiplier: 2
        console.log(this.multipliedCounter) // 0

        counter.value += 1;
        // counter: 1, multiplier: 2
        console.log(this.multipliedCounter) // 2

        this.multiplier = 4;
        // we changed multiplier value, but computed is not reevaluated,
        // because multiplier is not reactive
        // counter: 1, multiplier: 4
        console.log(this.multipliedCounter) // 2

        counter.value += 1
        // counter: 2, multiplier: 4
        console.log(this.multipliedCounter) // 8
    }
}
```

Computed properties can freely be used inside `TemplateComponent's` `template` method and will trigger rerender.
