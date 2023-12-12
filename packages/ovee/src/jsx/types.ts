import type * as jsx from 'html-jsx';

// this declaration allows us to augment JSX interfaces
declare module 'html-jsx' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars
	interface DOMAttributes<T> extends JSX.IntrinsicAttributes {}
}

// this introduces our JSX definitions into the global scope
declare global {
	namespace JSX {
		/** The type returned by our `createElement` factory. */
		type Element = string;

		interface IntrinsicElements extends jsx.IntrinsicElements {
			/** This allows for any tag to be used. */
			[k: string]: unknown;
		}

		// here we can add attributes for all the elements
		interface IntrinsicAttributes {
			/** List index key - each item's `key` must be unique. */
			key?: string | number;
		}

		/**
		 * These are exported to the global JSX namespace to allow
		 * declaring custom elements types.
		 * @see `playground/app.tsx`
		 */
		type HTMLAttributes<T> = jsx.HTMLAttributes<T>;
		type SVGAttributes<T> = jsx.SVGAttributes<T>;
		type DOMAttributes<T> = jsx.DOMAttributes<T>;
	}
}
