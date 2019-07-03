import { E2eElement } from './e2e-element';

/**
 * @private
 */
export function restrictor(tree: E2eElement[], excludeElements: string[] = [], restrictToElements: string[] = []): E2eElement[] {
    if (restrictToElements.length !== 0) {
        return restrictAndExcludeRecursive(tree, excludeElements || [], restrictToElements || []);
    } else if (excludeElements.length !== 0) {
        return excludeRecursive(tree, excludeElements);
    } else {
        return tree;
    }
}

/**
 * @private
 */
function restrictAndExcludeRecursive(tree: E2eElement[], excludeElements: string[], restrictToElements: string[]): E2eElement[] {
    const result: E2eElement[] = [];
    tree.forEach(x => {
        if (restrictAndExcludeElementRecursive(x, excludeElements, restrictToElements)) {
            result.push(x);
        }
    });
    return result;
}

/**
 * @private
 */
function excludeRecursive(tree: E2eElement[], excludeElements: string[]): E2eElement[] {
    const result: E2eElement[] = [];
    tree.forEach(x => {
        if (excludeElements.indexOf(x.id) === -1) {
            result.push(x);
            x.children = excludeRecursive(x.children, excludeElements);
        }
    });
    return result;
}

/**
 * @private
 */
function restrictAndExcludeElementRecursive(element: E2eElement, excludeElements: string[], restrictToElements: string[]): boolean {
    if (excludeElements.indexOf(element.id) !== -1) {
        return false;
    } if (restrictToElements.indexOf(element.id) !== -1) {
        element.children = excludeRecursive(element.children, excludeElements);
        return true;
    } else {
        const restrictionChildren: E2eElement[] = restrictAndExcludeRecursive(element.children, excludeElements, restrictToElements);
        if (restrictionChildren.length === 0) {
            return false;
        } else {
            // Is parent of restriction
            element.children = restrictionChildren;
            element.isPrivate = true;
            return true;
        }
    }
}
