import Barba from '@barba/core';
import { Module } from 'ovee.js';

import { ResolverClass } from './Resolver';

const { history, dom, request } = Barba;
export const DEFAULT_TIMEOUT = 20000;

export interface ContentLoaderOptions {
	timeout?: number;
	resolvers?: Record<string, ResolverClass>;
}

export class ContentLoader extends Module<ContentLoaderOptions> {
	timeout = DEFAULT_TIMEOUT;
	resolvers: Record<string, ResolverClass> = {};

	init(): void {
		this.timeout = this.options.timeout ?? DEFAULT_TIMEOUT;
		this.resolvers = this.options.resolvers ?? {};
	}

	getResolver(name: string): ResolverClass | false {
		if (this.resolvers[name] === undefined) {
			console.error(`Resolver not registered for key ${name}`);

			return false;
		}

		return this.resolvers[name];
	}

	async loadPage(
		url: string,
		resolverName: string,
		target: Element | null = null,
		pushState = true
	): Promise<void> {
		const ResolverCtor = this.getResolver(resolverName);

		if (!ResolverCtor) {
			return;
		}

		const resolver = new ResolverCtor(this.$app, target, url, pushState);
		const requestPage = request(url, this.timeout, (_url, err) => {
			console.error(`[ContentLoader] Error while requesting ${_url}`, err);

			return false;
		});

		await resolver.contentOut();

		const content = dom.toDocument(await requestPage);

		if (resolver.pushState && resolver.shouldPushState) {
			document.title = content.title;
			history.add(url, 'barba');
		}

		await resolver.updateContent(content);
		await resolver.contentIn();
	}

	static getName(): string {
		return 'ContentLoader';
	}
}
