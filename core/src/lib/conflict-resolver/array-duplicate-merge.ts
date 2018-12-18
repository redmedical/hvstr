import { E2eElement } from '../e2e-element/e2e-element';
import { elementTreeMerge } from '../e2e-element/element-tree-merge';

export function mergeDuplicateArrayElements(tree: E2eElement[]): void {
    for(let i = 0; i < tree.length; i++) {
        if (tree[i].isArrayElement) {
            findAndMergeDuplicates(tree, i);
        }
    }
    tree.forEach(x => mergeDuplicateArrayElements(x.children));
}

function findAndMergeDuplicates(tree: E2eElement[], i: number): void {
    for (let arrayDuplicateIndex = findDuplicateIndex(tree, i); arrayDuplicateIndex !== -1; arrayDuplicateIndex = findDuplicateIndex(tree, i)) {
        mergeArrayDuplicateForTreePartition(tree, i, arrayDuplicateIndex);
        tree.splice(arrayDuplicateIndex, 1);
    }
}

function mergeArrayDuplicateForTreePartition(tree: E2eElement[], i: number, arrayDuplicateIndex: number): void {
    const oldTree = tree[i].children;
    const addendTree = tree[arrayDuplicateIndex].children;
    const parent = tree[i];
    tree[i].children = elementTreeMerge(oldTree, addendTree, [], false, undefined, parent);
}

function findDuplicateIndex(tree: E2eElement[], i: number): number {
    return tree.findIndex(x => x.id === tree[i].id && x !== tree[i]);
}
