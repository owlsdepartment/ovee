export default function forEachPrototype<T = any>(obj: any, cb: (target: T) => void): void {
    if (obj === null || obj === undefined) {
        return;
    }

    let target = Object.getPrototypeOf(obj);

    while (target.constructor !== Object) {
        cb(target);

        target = Object.getPrototypeOf(target);
    }
}
