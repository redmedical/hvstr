import { E2eElement } from './e2e-element';

/**
 * @private
 */
export function elementTreeMerge(
    oldTree: E2eElement[],
    addendTree: E2eElement[],
    excludeElements: string[],
    isRestrictElementsChild: boolean,
    restrictToElements?: string[],
    parent?: E2eElement
): E2eElement[] {
    if (addendTree.length === 0) {
        return oldTree;
    }
    const resultTree: E2eElement[] = [...oldTree];
    resultTree.forEach(x => {
        x.parentElement = parent;
    });
    addAddendTree(resultTree, addendTree, excludeElements, isRestrictElementsChild, restrictToElements, parent);
    extendChildrenTreePartitionsRecursive(resultTree, addendTree, excludeElements, isRestrictElementsChild, restrictToElements);
    return resultTree;
}

/**
 * @private
 */
function addAddendTree(
    resultTree: E2eElement[],
    addendTree: E2eElement[],
    excludeElements: string[],
    isRestrictElementsChild: boolean,
    restrictToElements?: string[],
    parent?: E2eElement
): void {
    for (const addend of addendTree) {
        const isAddendExcluded = excludeElements.some(excludeElement => excludeElement === addend.id);
        const isAddendOutsideOfRestrict =
                restrictToElements
                && !isRestrictElementsChild
                && !restrictToElements.some(restrictedElement => restrictedElement === addend.id);

        if (isAddendExcluded || isAddendOutsideOfRestrict) {
            continue;
        }

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
    excludeElements: string[],
    isRestrictElementsChild: boolean,
    restrictToElements?: string[]
): void {
    for (const element of resultTree) {
        let elementIsRestrictElementsChild = isRestrictElementsChild;
        if (restrictToElements && !isRestrictElementsChild) {
            if (restrictToElements.find(restrictedElement => restrictedElement === element.id)) {
                elementIsRestrictElementsChild = true;
            }
        }
        const addendTreePartition = addendTree.find(addendElement => addendElement.id === element.id);
        if (!addendTreePartition) {
            continue;
        }
        element.children = elementTreeMerge(
            element.children || [],
            addendTreePartition.children,
            excludeElements,
            elementIsRestrictElementsChild,
            restrictToElements,
            element,
        );
    }
}
