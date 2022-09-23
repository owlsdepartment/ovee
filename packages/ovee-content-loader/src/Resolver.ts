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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async updateContent(content: HTMLDocument): Promise<void> {}
}

export type ResolverClass = typeof Resolver;
