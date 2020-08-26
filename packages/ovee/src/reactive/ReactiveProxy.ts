/* eslint-disable @typescript-eslint/ban-types */
import onChange from 'on-change';

import { Dictionary } from 'src/utils/types';

interface HandlerArguments<T> {
    path: string;
    value: T;
    previousValue: T;
}

export interface WatcherCallback<T> {
    (value: T, previousValue: T, path: string): void
}

class ReactiveProxy {
    enabledProps: string[] = [];
    watchers: Dictionary<WatcherCallback<any>[]> = {};
    isDestroyed = false

    readonly target!: object;
    readonly proxy!: ReturnType<typeof onChange>;

    constructor(target: object) {
        const proxy = onChange({}, this.handler.bind(this));

        Object.defineProperty(this, 'target', {
            value: target,
            writable: false
        });
        Object.defineProperty(this, 'proxy', {
            value: proxy,
            writable: false
        });
    }

    enableFor(propertyName: string): void {
        if (!this.enabledProps.includes(propertyName)) {
            const { proxy, target } = this;

            proxy[propertyName] = (target as any)[propertyName];

            Object.defineProperty(target, propertyName, {
                configurable: true,
                get() {
                    return Reflect.get(proxy, propertyName);
                },
                set(value) {
                    return Reflect.set(proxy, propertyName, value);
                }
            });

            this.enabledProps.push(propertyName);
        }
    }

    handler<T = any>(path: string, value: T, previousValue: T): void {
        // eslint-disable-next-line no-console
        this.callWatchers('*', {
            path, value, previousValue
        });

        path.split('.').reduce((prev, curr) => {
            const next = prev ? `${prev}.${curr}` : curr;

            this.callWatchers(next, {
                path, value, previousValue
            });

            return next;
        }, '');
    }

    callWatchers<T = any>(path: string, props: HandlerArguments<T>): void {
        if (this.watchers[path]) {
            this.watchers[path].forEach(
                (watcher) => watcher.apply(this.target, this.extractProps(props))
            );
        }
    }

    private extractProps<T>(props: HandlerArguments<T>): [T, T, string] {
        const { path, value, previousValue } = props;

        return [value, previousValue, path];
    }

    watch<T = any>(path: string, callback: WatcherCallback<T>): () => void {
        if (!this.watchers[path]) {
            this.watchers[path] = [];
        }

        if (this.watchers[path].indexOf(callback) < 0) {
            this.watchers[path].push(callback);
        }

        return () => {
            const index = this.watchers[path] && this.watchers[path].indexOf(callback);

            if (index >= 0) {
                this.watchers[path].splice(index, 1);
            }
        };
    }

    destroy(): void {
        if (!this.isDestroyed) {
            this.isDestroyed = true;
            onChange.unsubscribe(this.proxy);
        }
    }
}

export default ReactiveProxy;
