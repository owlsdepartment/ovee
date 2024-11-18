import barba from '@barba/core';
import { App } from 'ovee.js';

const { history } = barba;

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

	updateHistory(title: string, url: string): void {
		document.title = title;
		history.add(url, 'barba');
	}

	handleError(): void {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async updateContent(doc: Document): Promise<void> {}
}

export type ResolverClass = typeof Resolver;
