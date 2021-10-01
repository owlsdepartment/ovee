# Reactivity API

`Ovee.js` reactivity is based on `Vue 3` reactivity system. It uses two packages:

 - [`@vue/reactivity`](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
 - [`@vue/runtime-core`](https://github.com/vuejs/vue-next/tree/master/packages/runtime-core)

Features are filtered from these packages, but if you ever feel like something is missing, just create a new issue! 👉 [Ovee.js](https://github.com/owlsdepartment/ovee/issues/new)

Most of this documentation links to external `Vue 3` docs, as they did a great job documenting all of it's features and functionalities! So for explicit explenation of every feature (except `ReactiveProxy` and `makeComponentReactive`), we recommend going straight there:
 - [Vue 3 Reactivity API](https://v3.vuejs.org/api/reactivity-api.html)

## ReactiveProxy

Utility class, that creates `Vue 3` `reactive` instance and allows you for a selective field reactivity. You can find it in `Components`, that uses any decorator which requires from a component to be reactive. It's applied through helper `makeComponentReactive` and you probably don't need to use it at all.

## makeComponentReactive

Applies `ReactiveProxy` on a component and saves it's instance under `protectedFields.REACTIVE_PROXY`, only if given object already doesn't have `ReactiveProxy` applied. It's useful if you make a custom decorator which functionality is based on reactivity of a component. In any other case, you don't really need it.

## Reactive objects API

 - `makeReactive` - Used to create reactive objects. Alias for Vue 3: [reactive](https://v3.vuejs.org/api/basic-reactivity.html#reactive)
 - `makeComputed` - Used to create computed function with lazy evaluation, that reevaluates only when reactive dependencies change. Alias for Vue 3: [computed](https://v3.vuejs.org/api/computed-watch-api.html#computed)
 - `readonly` - Create readonly proxy object. Vue 3 docs: [readonly](https://v3.vuejs.org/api/basic-reactivity.html#readonly)
 - `isProxy` - Check if object is Proxy created by `makeReactive` or `readonly`. Vue 3 docs: [isProxy](https://v3.vuejs.org/api/basic-reactivity.html#isproxy)
 - `isReactive` - Check if object was created by `makeReactive`. Vue 3 docs: [isReactive](https://v3.vuejs.org/api/basic-reactivity.html#isreactive)
 - `isReadonly` - Check if object was ceated by `readonly`. Vue 3 docs: [isReadonly](https://v3.vuejs.org/api/basic-reactivity.html#isreadonly)
 - `toRaw` - Returns target object of `makeReactive` proxy. Vue 3 docs: [toRaw](https://v3.vuejs.org/api/basic-reactivity.html#toraw)
 - `markRaw` - Prevent object from converting to reactive one. Vue 3 docs: [markRaw](https://v3.vuejs.org/api/basic-reactivity.html#markraw)
 - `shallowReactive` - Creates a reactive proxy that tracks reactivity of its own properties but does not perform deep reactive conversion of nested objects (exposes raw values). Vue 3 docs: [shallowReactive](https://v3.vuejs.org/api/basic-reactivity.html#shallowreactive)
 - `shallowReadonly` - Creates a proxy that makes its own properties readonly, but does not perform deep readonly conversion of nested objects (exposes raw values). Vue 3 docs: [shallowReactive](https://v3.vuejs.org/api/basic-reactivity.html#shallowreadonly)

## Ref API

 - `ref` - Creates reactive mutable object with field `.value` for single value. Vue 3 docs: [ref](https://v3.vuejs.org/api/refs-api.html#ref)
 - `unref` - Return inner value if argument is `ref`, else return argument untouched. Vue 3 docs: [unref](https://v3.vuejs.org/api/refs-api.html#unref)
 - `toRef` - Create `ref` from a `reactive` objects single property, retaining it's reactivity. Vue 3 docs: [toRef](https://v3.vuejs.org/api/refs-api.html#toref)
 - `toRefs` - Same as `toRef`, but for a whole object, where each field is a `ref`. Vue 3 docs: [toRefs](https://v3.vuejs.org/api/refs-api.html#torefs)
 - `isRef` - Check if value is `ref` object. Vue 3 docs: [isRef](https://v3.vuejs.org/api/refs-api.html#torefs)
 - `customRef` - Creates a customized ref with explicit control over its dependency tracking and updates triggering. Vue 3 docs: [customRef](https://v3.vuejs.org/api/refs-api.html#customref)
 - `shallowRef` - Creates a `ref` that tracks its own `.value` mutation but doesn't make its value reactive. Vue 3 docs: [shallowRef](https://v3.vuejs.org/api/refs-api.html#shallowref)
 - `triggerRef` - Execute any effects tied to a `shallowRef` manually. Vue 3 docs: [triggerRef](https://v3.vuejs.org/api/refs-api.html#triggerref)

## Watch API

 - `doWatch` - Watch for changes in specified source. Alias for Vue 3: [watch](https://v3.vuejs.org/api/computed-watch-api.html#watch)
 - `doWatchEffect` - Immediate watch, that can automatically detect all reactive sources used inside. Alias for Vue 3: [watchEffect](https://v3.vuejs.org/api/computed-watch-api.html#watcheffect)
 - `makeComputed` - Creates a cachable function that recalculates it's value whenever reactive values change inside. Alias for Vue 3: [computed](https://v3.vuejs.org/api/computed-watch-api.html#computed)
