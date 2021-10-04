# Reactivity Overview

In version `2.1`, we replaced custom-made `Ovee.js` reactivity and use the one from `Vue 3` as it's fully independent from framework and is based on `Proxy` system: the same way we did! But maintaining so complex system, like reactivity, is tough, especially for a small team. So we choose to use tested and safe solution.

In this article, we run over some basic examples of how we can use reactivity outside of the components, as currently, it's totally independent! If you're looking for a deep dive into the reactivity system implemented by `Vue` team and how it works, we recommend you this article: 👉 [Reactivity in Depth](https://v3.vuejs.org/guide/reactivity.html).

Here you can find API with list of all available tools for reactivity and links to specific places in `Vue 3` docs: 👉 [Reactivity API](./api).

Now, let's jump to some examples!

## Building dialog system

Let's say you have a lot of dialogs and would like to keep and manage them in one, global place. We can start with a singleton class:

```js
let instance;

export class DialogSystem {
    constructor() {
        this.root = document.createElement('div');
        this.root.classList.add('dialog-root')

        document.body.appendChild(this.root)
    }

    static getInstance() {
        if (!instance) {
            instance = new DialogSystem();
        }

        return instance;
    }
}
```

So, what's going on here? We have a singleton pattern, with the static method `getInstance`. Every time, we try to call `DialogSystem.getInstance()`, we would check if `DialogSystem` instance exists and if not, we create one. Then return a new instance or a cached one. With this approach, we ensure to always have one single instance.

Then, in the constructor, we create a new `div` element and append it to `body`. We don't care about either styling or HTML structure, we are focusing on JS functionality.

Next, we need to add a way to store new dialogs. Let's change out `constructor`!

```js
import { ref } from 'ovee.js';

let instance;

export class DialogSystem {
    constructor() {
        const root = document.createElement('div');

        root.classList.add('dialog-root')
        document.body.appendChild(document)

        // store dialogs
        this.dialogs = ref([])
    }

    /* ... */
}
```

We used our first reactivity tool: `ref`. It creates reactive object with field `.value`. If reference under `.value` changes, we would now. Example:

```js
const arr = ref([1, 2, 3])

arr.value = [1, 2, 3] // <- this will trigger a change!
```

Coming back to our example! Let's add a method, that allow us to create dialogs!.

```js
import { ref, markRaw } from 'ovee.js';

export class DialogSystem {
    /* ... */

    // some options for dialog
    createDialog(options, open = false) {
        const dialog = new Dialog(options);

        this.dialogs.push(markRaw(dialog)); // <- markRaw?!

        if (open) {
            dialog.open();
        }

        return dialog;
    }

    /* ... */
}
```

So creating dialogs is quite simple: we create `Dialog` class instance (its implementation is irrelevant currently for us) and push it to the array. But what's about this `markRaw` method?!
`ref` and `makeReactive` do a little bit of magic, that unwraps any nested `ref` inside it. To prevent it, we use `markRaw` to say: "We want to keep it that way, don't touch it!".

The further part is pretty simple, if the user wants to open dialog immediately, he just needs to pass 2nd argument as `true`.

Currently, we have a way to store and create our dialogs. Let's just define our `Dialog` class with its most important feature: opening and closing itself!

```js
export class Dialog {
    constructor(options) {
        isOpen = ref(false) // once again ref, but with boolean value this time

        // ... do something with options
    }

    open() {
        this.isOpen.value = true;
    }

    close() {
        this.isOpen.value = false;
    }
}
```

The `Dialog` class is super simple: it just keeps its own state about being open or not. Very important note: `isOpen` is reactive!

Now let's add a way to show our dialogs:

```js
export class DialogSystem {
    /* ... */

    constructor() {
        /* ... */

        this.openDialogs = makeComputed(() => {
            return this.dialogs.filter(d => d.isOpen)
        })

        watchEffect(() => {
            this.root.innerHTML = this.openDialogs.value.reduce((acc, dialog) => {
                return acc + dialog.render();
            }, '')
        })
    }
    /* ... */
}
```

First things first: we add a helper `computed` using `makeComputed`, to track and return all of our open dialogs. It's cached, so even if we access it 1000 times, we would return the same value if none of those dialogs changed its state. Similar to `ref`, it returns an object with the `.value` field.

Next, we use our `computed` to render dialogs. We use magic `reduce` function and merge all dialogs in one, long, HTML string and then set it as `innerHTML` of our root element. To rerun this method everytime we open/close one of the dialogs, we wrap it in `watchEffect`. This watcher automatically tracks all reactive references and reruns everytime something changes, in our case: when some dialog is opened or closed.

This is just a core concept, where you can optionally transform it into an `Ovee.js` component, add a way to destroy dialogs, unregister them, etc., but it shows you that you're free to use reactive variables and watcher's in different scenarios.

Let's take a look on one more example: global state management.

## Building your own state managment system (store)

In frameworks like `Vue` or `React`, there is often some sort of a global state management tool. In `React`, it's `Flux`, and in `Vue` it's `Vuex`. But you can make something much simpler for your small needs with little to no effort! Let's create an object that would store fetched posts.

```js
export const postsStore = makeReactive({
    posts: [],
    lastFetched: null,

    getPostsByUserId: makeComputed(() => id => {
        return this.posts.filter(post => post.user_id === id);
    }),

    readPosts: makeComputed(() => {
        return this.posts.filter(post => post.status === 'read');
    })
})
```

Now we use `makeReactive` to create reactive object that can track changes of it's fields. Wi initialized `posts` field, to keep out posts and created to computeds: `getPostsByUserId`, that returns a function which than, based on passed id and state, returns different values, and `readPosts` that always returns only `read` posts.

Now we can use it in our component, especially cool in `TemplateComponent`:

```js
import { postsStore } from '@/store'

export class PostsList extends TemplateComponent {
    template(html) {
        return html`
            <ul>
                ${postsStore.readPosts.map(post => html`<li>${post.name}</li>`)}
            </ul>
        `;
    }
}
```
Note, that because we used `makeReactive`, we don't need to use `.value` when accessing `makeComputed` values.

We can also make a list of all user-specific posts using `data-` attribute:

```js
import { postsStore } from '@/store'

export class PostsList extends TemplateComponent {
    @reactive()
    @dataParam()
    id;

    template(html) {
        return html`
            <ul>
                ${postsStore.getPostsByUserId(this.id).map(post => (
                    html`<li>${post.name}</li>`
                ))}
            </ul>
        `;
    }
}
```

Because `postsStore` is super simple and in no way protected, everybody can change its state.

To prevent that and minimalize bugs potential, you can restrict yourself and create special `postsMutations` or `postsActions` that only these methods will be allowed to change this state.

```js
export const postsActions = {
    fetchPosts() {
        /* just do some fecthing... */
        const posts = ajax.fetch( /* ... */ );

        postsStore.posts = posts;
    }

    removePost(post) {
        const toRemove = postsStore.posts.findIndex(p => p.id === post.id);

        if (toRemove >= 0) {
            postsStore.posts.splice(toRemove, 1);
        }
    }
}
```

---

These are just few exemples of all the possibilities you can do with reactive tools!

In near future we plan to add `Ovee.js` store pattern implementation as a new module. Keep an eye for our updates! 😀
