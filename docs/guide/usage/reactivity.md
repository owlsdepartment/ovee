# Reactivity

In the current world of JavaScript, reactivity is a core tool, that frameworks like [React](https://react.dev/), [Vue](https://vuejs.org/), and many others rely on. It lets you write code that can react or detect changes, without a huge amount boilerplate and explicit code.

Ovee.js uses for that purpose Vue's implementation of the reactivity system. The Vue team did a great job with that task. Using years of experience, they created a powerful and simple way of writing and managing reactive code. They also did a great job with documentation and introduction to that concept, so we will just link to source material documentation.

There are three main topics:
 - [Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
 - [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
 - [Watchers](https://vuejs.org/guide/essentials/watchers.html)

::: info
Vue reactive API is exposed through the `ovee.js` package, so you should import it like:

```ts
import { ref, reactive, watchEffect } from 'ovee.js'
```
:::
