import { E2eElement } from '../../src/lib/e2e-element/e2e-element';

// This file adds a matcher 'toEqualE2eElementTree' for all tests

/**
 * @returns {(string | undefined)} Returns undefined, if object are equal.
 */
function e2eElementNotEquals(a: E2eElement | undefined, b: E2eElement | undefined): string | false {
    if (!a && !b) {
        return false;
    } else if (!a || !b) {
        return `${a ? a.id : b!.id} is unequal to undefined`; // b! because typescript dos not recognize, that be has to be truethy.: !(!a && !b) && !a => b
    }
    if (a.conflictFreeId !== b.conflictFreeId) {
        return `unequal conflictFreeId ("${a.conflictFreeId}", "${b.conflictFreeId}")`;
    }
    if (a.type !== b.type) {
        return `unequal types ("${a.type}", "${b.type}")`;
    }
    return false;
}

/**
 * @returns {(string | undefined)} Returns undefined, if object are equal
 */
function recursiveE2eElementTreeNotEqual(a: E2eElement[], b: E2eElement[]): string | false {
    if (a.length !== b.length) {
        return `tree layer's length is not equal (${a.length} !== ${b.length})`;
    }
    for (let i = 0; i < a.length; i++) {
        let evalResult: string | false = false;
        evalResult = e2eElementNotEquals(a[i], b[i]);
        if (evalResult) {
            return `${evalResult}\n\t-> in ${a[i].id}`;
        }
        evalResult = e2eElementNotEquals(a[i].parentElement, b[i].parentElement);
        if (evalResult) {
            return `unequal parent elements\n\t-> parents: ${evalResult}\n\t-> in ${a[i].id}`;
        }
        evalResult = recursiveE2eElementTreeNotEqual(a[i].children, b[i].children);
        if (evalResult) {
            return `${evalResult}\n\t-> in ${a[i].id}`;
        }
    }
    return false;
}

interface compareResult {
    pass: boolean;
    message: string | undefined;
}

beforeAll(() => {
    jasmine.addMatchers({
        toEqualE2eElementTree: function(util: any, customEqualityTesters: any): { compare: (actual: E2eElement[], expected: E2eElement[]) => compareResult } {
            return {
                compare: function(actual: E2eElement[], expected: E2eElement[]): compareResult {
                    const result: compareResult = {
                        pass: false,
                        message: undefined,
                    };
                    const recursiveE2eElementTreeEqualResult: string | false = recursiveE2eElementTreeNotEqual(actual, expected);
                    if (recursiveE2eElementTreeEqualResult) {
                        result.message = recursiveE2eElementTreeEqualResult;
                    } else {
                        result.pass = true;
                    }
                    return result;
                }
            };
        }
    });
});
