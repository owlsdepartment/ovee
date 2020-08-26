import toKebabCase from 'src/utils/toKebabCase';

function decorate(target: any, name: string) {
    if (!name) {
        console.error('Name must be provided for component decorator', target);
        return target;
    }

    if (!target.prototype) {
        console.error('Decorator works only for classes', target);
        return target;
    }

    name = toKebabCase(name);

    if (!name.includes('-')) {
        console.error('Component name must consist of at least two words', target);
        return target;
    }

    target.getName = function getName() {
        return name;
    };

    return target;
}

export default function (name: string) {
    return (target: any): any => decorate(target, name);
}
