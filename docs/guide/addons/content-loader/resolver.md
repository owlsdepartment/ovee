# Resolver

The Resolver class is responsible for managing content transitions and history updates. It integrates with the `@barba/core` library for history management.

## Props

- `shouldPushState: boolean` - Indicates whether the state should be pushed to the history.

## Methods

### `async contentOut(): Promise<void>`

This asynchronous method is intended to handle the transition of the old content. It's an empty method that can be overridden in subclasses.

### `async updateContent(doc: Document): Promise<void>`

Updates the content based on the provided `Document`. This method is asynchronous and is designed to be overridden in subclasses.

`doc: Document` - The new document content.

### `updateHistory(title: string, url: string): void`

Updates the browser's history and document title.

`title: string` - The new title for the document.
`url: string` - The URL to add to the history.

Default:

```ts
updateHistory(title: string, url: string): void {
    document.title = title;
    history.add(url, 'barba');
}
```

### `handleError(): void`

Handles errors that may occur during the content update or navigation process. The method is currently a stub and can be implemented in subclasses.

### `async contentIn(): Promise<void>`

This asynchronous method is intended to handle the transition of new content. Like `contentOut`, it's an empty method that can be overridden in subclasses.

## Type Alias

### `ResolverClass`

A TypeScript type alias representing the `Resolver` class.

```ts
export type ResolverClass = typeof Resolver;
```

## Example

[See example](./module.md#example)
