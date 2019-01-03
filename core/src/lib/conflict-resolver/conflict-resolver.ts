import { ConflictTree } from './conflict-tree';
import { E2eElement } from '../e2e-element/e2e-element';
import { ConflictElement } from './conflict-element';

/**
 * @private
 */
export function ConflictResolver(tree: E2eElement[]): void{
    const maybeConflictTree: ConflictTree | null = buildConflictTree(tree);
    if(!maybeConflictTree) {
        return;
    }
    const conflictTree: ConflictTree = maybeConflictTree!;
    conflictTree.conflictList.forEach(conflictTreeConflict => {
        getConflictElementArrayLike(conflictTreeConflict.getConflicts())
            .resolveParentPathForEach()
            .findConflictRootForEach()
            .setConflictFreeIdForEach();
    });
}

/**
 * @private
 */
function buildConflictTree(elementTree: E2eElement[], conflictTree?: ConflictTree): ConflictTree | null {
    if(!elementTree || elementTree.length === 0) {
        return null;
    }
    for(let element of elementTree) {
        if(!conflictTree) {
            conflictTree = new ConflictTree(element);
        } else {
            conflictTree!.insert(element);
        }
        buildConflictTree(element.children, conflictTree);
    }
    return conflictTree || null;
}

/**
 * @private
 */
function getConflictElementArrayLike(conflictElementArray: ConflictElement[]): IConflictElementArrayLike {
    return {
        resolveParentPathForEach(): IConflictElementArrayLike {
            conflictElementArray.forEach(x => x.resolveParentPath());
            return this;
        },
        setConflictFreeIdForEach(): IConflictElementArrayLike {
            conflictElementArray.forEach(x => x.setConflictFreeId());
            return this;
        },
        findConflictRootForEach(): IConflictElementArrayLike{
            this.forEachCrossProduct((x,y) => x.findConflictRoot(y));
            return this;
        },
        forEachCrossProduct(callback: (x: ConflictElement, y:ConflictElement) => void): IConflictElementArrayLike {
            conflictElementArray.forEach(x =>{
                conflictElementArray
                    .filter(y => x !== y)
                    .forEach(y => callback(x,y));
            });
            return this;
        }
    };
}

/**
 * @private
 */
interface IConflictElementArrayLike {
    resolveParentPathForEach(): IConflictElementArrayLike;
    setConflictFreeIdForEach(): IConflictElementArrayLike;
    findConflictRootForEach(): IConflictElementArrayLike;
    forEachCrossProduct(callback: (x: ConflictElement, y: ConflictElement) => void): IConflictElementArrayLike;
}
