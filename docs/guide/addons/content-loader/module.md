# ContentLoader Module

The ContentLoader module is responsible for loading and transitioning content. It uses resolvers to manage different types of content transitions and handles errors during the content loading process.

## Constants

- `DEFAULT_TIMEOUT`: The default timeout value for loading content, set to 20,000 milliseconds (20 seconds).

## Methods

### `async loadPage(url, resolverName, target, pushState): Promise<void>`

Asynchronously loads new content using the specified [resolver](./resolver.md).

- `url: string` - The URL of the page to load.
- `resolverName: string` - The name of the resolver to use for the content transition.
- `target?: Element | null `- The target DOM element for the content. Defaults to `null`.
- `pushState?: boolean` - Indicates whether to push the state to the history. Defaults to `true`.

## How it's works

1. Makes a request to load the content from the specified URL with a timeout.
2. Calls the `contentOut` method on the resolver to manage the transition of the old content.
3. Attempts to fetch and parse the new content.
    1. If it occurs error, it calls the `handleError` method and the process ends.
    2. If fetch attempt is successfull and the `Resolver` should push the state, it updates the browser's history (calls the `updateHistory` method).
4. Calls the resolver's `updateContent` method to update the DOM with the new content.
5. Finally, calls the `contentIn` method on the resolver to finalize the transition.

## Types

### ContentLoaderOptions

Defines the options that can be passed to the `ContentLoader` module.

- `resolvers: Record<string, ResolverClass>` - Required. A record of resolver classes keyed by a string identifier. These resolvers are responsible for managing different aspects of content transitions.
- `timeout?: number` - Optional. The timeout duration in milliseconds for content loading requests.

### ContentLoaderReturn

The return type of the ContentLoader module, providing a method for loading pages.

`loadPage: (url: string, resolverName: string, target?: Element | null, pushState?: boolean) => Promise<void>` - Function to load content using the specified resolver and handle the content transition.

## Example

::: code-group
```ts [app.ts]
import { createApp } from 'ovee.js';
import OveeBarba from '@ovee.js/barba';

import { ContentLoader } from '@ovee.js/content-loader'; // [!code focus]
import { DefaultResolver } from './DefaultResolver';

const root = document.body;

createApp()
    .use('ContentLoader', ContentLoader, { // [!code focus]
        timeout: 15000, // [!code focus]
        resolvers: { // [!code focus]
            'default': DefaultResolver, // [!code focus]
        } // [!code focus]
    }) // [!code focus]
    .run(root);
```

```ts [DefaultResolver.ts]
import { Resolver } from '@ovee.js/content-loader';
import gsap from 'gsap';

export class DefaultResolver extends Resolver {
    oldContent: HTMLElement | null = null;
    newContent: HTMLElement | null = null;
    shoudlPushState = true;

    async contentOut() {
        this.oldContent = document.querySelector('.content');

        await gsap.to(this.oldContent, {
            autoAlpha: 0,
        });
    }

    handleError() {
       window.alert('Oops, something went wrong');

       gsap.set(this.oldContent, {
            autoAlpha: 1,
        });
    }

    async updateContent(doc: Document) {
        this.newContent = doc.querySelector('.content');

        if(!this.newContent) {
            return;
        }

        gsap.set(this.oldContent, {
            autoAlpha: 0
        });

        this.oldContent.insertAfter(this.newContent);
        this.oldContent.remove();
    }

    async contentIn() {
        await gsap.to(this.newContent, {
            autoAlpha: 1
        });
    }
}
```

```ts [LoadMoreComponent.ts]
export const LoadMore = defineComponent((element) => {
    const contentLoader = useModule('ContentLoader', true);
    const nextPageUrl = useDataAttr('next-page-url');

    async function loadMore() {
        if(!nextPageUrl) {
            return;
        }

        await contentLoader?.loadPage(nextPageUrl, 'default', null, false);
    }
})
```
:::