# Component Decorators

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
 - `selector?: string` - optional selector for which child element bind listeners. If not specified, root element will be used.

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
}
```

## @reactive
Makes property reactive by using [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

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
Watch given path and call method that decorates, when value under given path change. Can only watch properties, that are marked as reactive.

Parameters:
 - `path: string` - path to watch under `this`, f.ex.: `counter`, `obj.a`.
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
