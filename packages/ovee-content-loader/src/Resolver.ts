import { App } from 'ovee.js';

export class Resolver {
	shouldPushState = false;

	// eslint-disable-next-line no-useless-constructor
	constructor(
		public app: App,
		public target: Element | null,
		public href: string,
		public pushState: boolean
	) {}

	async contentIn(): Promise<void> {}

	async contentOut(): Promise<void> {}

	async updateContent(content: HTMLDocument): Promise<HTMLDocument> {
		return content;
	}
}

export type ResolverClass = typeof Resolver;
