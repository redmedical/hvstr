import { E2eElement } from './e2e-element';

/**
 * @private
 */
export function elementTreeMerge(
    oldTree: E2eElement[],
    addendTree: E2eElement[],
    parent?: E2eElement
): E2eElement[] {
    if (addendTree.length === 0) {
        return oldTree;
    }
    const resultTree: E2eElement[] = [...oldTree];
    resultTree.forEach(x => {
        x.parentElement = parent;
    });
    addAddendTree(resultTree, addendTree, parent);
    extendChildrenTreePartitionsRecursive(resultTree, addendTree);
    return resultTree;
}

/**
 * @private
 */
function addAddendTree(
    resultTree: E2eElement[],
    addendTree: E2eElement[],
    parent?: E2eElement
): void {
    for (const addend of addendTree) {
        const elementWithIdIsAlreadyListed = Boolean(resultTree.find(alreadyListedElement => addend.id === alreadyListedElement.id));
        if (!elementWithIdIsAlreadyListed) {
            addend.parentElement = parent;
            resultTree.push(addend);
        }
    }
}

/**
 * @private
 */
function extendChildrenTreePartitionsRecursive(
    resultTree: E2eElement[],
    addendTree: E2eElement[],
): void {
    for (const element of resultTree) {
        const addendTreePartition = addendTree.find(addendElement => addendElement.id === element.id);
        if (!addendTreePartition) {
            continue;
        }
        element.children = elementTreeMerge(
            element.children || [],
            addendTreePartition.children,
            element,
        );
    }
}
