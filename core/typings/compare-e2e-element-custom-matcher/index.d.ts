// This file adds the typings for the matcher 'toEqualE2eElementTree'

interface IExtendedArrayLikeMatchers<T> extends jasmine.ArrayLikeMatchers<T[]> {
    toEqualE2eElementTree(expected: T[]): boolean;
}

declare function expect<T>(actual: T[]): IExtendedArrayLikeMatchers<T>;
