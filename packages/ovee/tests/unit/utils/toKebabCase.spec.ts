import toKebabCase from 'src/utils/toKebabCase';

describe('toKebabCase function', () => {
    it('should replace whitespace with dash', () => {
        expect(toKebabCase(' ')).toMatch('-');
    });

    it('should convert uppercase to lowercase', () => {
        expect(toKebabCase('ABC')).toMatch('abc');
    });

    it('should convert camelCase to kebab-case', () => {
        expect(toKebabCase('camelCase')).toMatch('camel-case');
    });
});
